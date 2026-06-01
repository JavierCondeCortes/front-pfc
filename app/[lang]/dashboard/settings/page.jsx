import { getDictionary } from '@/lib/get-dictionary';
import SettingsClient from './settingsClient';

export default async function Page({ params }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    return <SettingsClient dict={dict} lang={lang} />;
}
