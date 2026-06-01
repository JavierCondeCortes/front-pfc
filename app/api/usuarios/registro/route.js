export async function POST(request) {
    try {
        const body = await request.text();
        const response = await fetch('http://localhost:8080/api/usuarios/registro', {
            method: 'POST',
            headers: {
                Accept: 'text/plain',
                'Content-Type': 'application/json',
            },
            body,
        });

        const message = await response.text();
        return new Response(message, {
            status: response.status,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
    } catch {
        return new Response('No se pudo conectar con el servidor de registro.', {
            status: 502,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
    }
}
