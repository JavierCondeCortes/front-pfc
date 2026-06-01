import { getDictionary } from '@/lib/get-dictionary';
import HistoryClient from './historyClient';

export default async function Page({ params }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    return <HistoryClient dict={dict} lang={lang} />;
}
