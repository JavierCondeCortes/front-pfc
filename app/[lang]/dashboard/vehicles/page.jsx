import { getDictionary } from '@/lib/get-dictionary';
import VehiclesClient from './vehiclesClient';

export default async function Page({ params }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    return <VehiclesClient dict={dict} lang={lang} />;
}