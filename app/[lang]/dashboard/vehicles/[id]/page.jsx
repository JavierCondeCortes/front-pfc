import { getDictionary } from '@/lib/get-dictionary';
import VehicleDetailClient from './vehicleDetailClient';

export default async function Page({ params }) {
    const { lang, id } = await params;
    const dict = await getDictionary(lang);

    return <VehicleDetailClient dict={dict} lang={lang} vehicleId={id} />;
}

