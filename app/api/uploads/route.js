import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
]);

export async function POST(request) {
    try {
        const data = await request.formData();
        const file = data.get('file');
        const folder = String(data.get('folder') || 'documents').replace(/[^a-z0-9_-]/gi, '').toLowerCase();
        const key = String(data.get('key') || '').replace(/[^a-z0-9:_-]/gi, '').toLowerCase();

        if (!file || typeof file === 'string') {
            return Response.json({ message: 'No se ha enviado ningun archivo.' }, { status: 400 });
        }

        if (!ALLOWED_TYPES.has(file.type)) {
            return Response.json({ message: 'Formato no permitido. Usa imagenes o PDF.' }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE) {
            return Response.json({ message: 'El archivo supera el limite de 10MB.' }, { status: 400 });
        }

        const bytes = Buffer.from(await file.arrayBuffer());
        const extension = path.extname(file.name) || extensionFromType(file.type);
        const safeBaseName = path.basename(file.name, extension).replace(/[^a-z0-9_-]/gi, '-').toLowerCase() || 'archivo';
        const fileName = `${Date.now()}-${safeBaseName}${extension}`;
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);

        await mkdir(uploadDir, { recursive: true });
        await writeFile(path.join(uploadDir, fileName), bytes);

        const url = `/uploads/${folder}/${fileName}`;
        if (key) {
            const manifest = await readManifest(uploadDir);
            manifest[key] = url;
            await writeFile(path.join(uploadDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
        }

        return Response.json({
            name: file.name,
            type: file.type,
            size: file.size,
            url,
        });
    } catch {
        return Response.json({ message: 'No se pudo guardar el archivo en el servidor.' }, { status: 500 });
    }
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const folder = String(searchParams.get('folder') || 'documents').replace(/[^a-z0-9_-]/gi, '').toLowerCase();
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
        const manifest = await readManifest(uploadDir);
        return Response.json(manifest);
    } catch {
        return Response.json({});
    }
}

async function readManifest(uploadDir) {
    try {
        return JSON.parse(await readFile(path.join(uploadDir, 'manifest.json'), 'utf8'));
    } catch {
        return {};
    }
}

function extensionFromType(type) {
    if (type === 'application/pdf') return '.pdf';
    if (type === 'image/png') return '.png';
    if (type === 'image/webp') return '.webp';
    if (type === 'image/gif') return '.gif';
    return '.jpg';
}
