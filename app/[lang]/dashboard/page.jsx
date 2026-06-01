import { getDictionary } from '@/lib/get-dictionary';
import LandingClient from './dashboardClient';

export default async function Page({ params }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    return <LandingClient dict={dict} lang={lang} />;
}