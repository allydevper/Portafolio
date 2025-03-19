import { showToastFront } from '@/lib/customToast';
import React, { useState } from 'react';
import { Toaster } from 'sonner';

const ContactForm: React.FC = () => {

    const email = 'alamaswilmer@gmail.com';

    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {

        e.preventDefault();
        setIsSubmitting(true);

        const formDataObj = new FormData(e.currentTarget);
        try {
            const response = await fetch(`https://formsubmit.co/ajax/${email}`, {
                method: "POST",
                body: formDataObj,
                headers: {
                    Accept: "application/json",
                },
            });

            if (response.ok) {
                setFormData({ name: '', email: '', message: '' });
                showToastFront("Mensaje enviado con éxito!", 'success');
            } else {
                showToastFront("Hubo un error al enviar el mensaje.", 'danger');
            }
        } catch (error) {
            showToastFront("Hubo un error de conexión.", 'danger');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className='max-w-4xl mx-auto'>
            <Toaster />
            <h2 className="text-3xl font-bold mb-4 text-yellow-300">Contáctame</h2>
            <p className="mb-4 text-justify">
                No dudes en comunicarte por correo electrónico <span className="font-bold">({email})</span> o usar el formulario de contacto a continuación.
            </p>
            <form id="contact-form" className="max-w-lg mx-auto" onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="name"
                    placeholder="Tu Nombre"
                    className="w-full mb-4 p-2 rounded-lg bg-white text-black"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Tu Correo Electrónico"
                    className="w-full mb-4 p-2 rounded-lg bg-white text-black"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                <textarea
                    name="message"
                    placeholder="Tu Mensaje"
                    className="w-full mb-4 p-2 rounded-lg bg-white text-black"
                    value={formData.message}
                    onChange={handleChange}
                    required
                ></textarea>
                <button
                    type="submit"
                    id="submit-button"
                    className="w-full py-3 bg-yellow-300 text-black font-bold rounded-full hover:bg-white hover:text-black transition duration-300 cursor-pointer"
                    aria-label="Enviar mensaje"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Enviando...' : 'Enviar'}
                </button>
            </form>
        </div>
    );
};

export default ContactForm;