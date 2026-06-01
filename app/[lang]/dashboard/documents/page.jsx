import { getDictionary } from '@/lib/get-dictionary';
import VehicleDocumentsVault from './documentsClient';

export default async function Page({ params }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    return <VehicleDocumentsVault dict={dict} lang={lang} />;
}
