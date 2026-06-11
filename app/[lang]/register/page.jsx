import { getDictionary } from '@/lib/get-dictionary';
import RegisterClient from './registerClient';

export default async function RegisterPage({ params }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    return (
        <RegisterClient 
            dict={dict} 
            lang={lang} 
        />
    );
}
