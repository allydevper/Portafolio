import { showToastFront } from '@/lib/customToast';
import React, { useState } from 'react';
import { Toaster } from 'sonner';

export type ContactFormVariant = 'default' | 'terminal';

type ContactFormProps = {
    variant?: ContactFormVariant;
};

const ContactForm: React.FC<ContactFormProps> = ({ variant = 'default' }) => {

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

    if (variant === 'terminal') {
        return (
            <>
                <Toaster theme="dark" />
                <form id="contact-form-terminal" className="terminal-form" onSubmit={handleSubmit}>
                    <input type="hidden" name="_subject" value="Contacto · portafolio (terminal)" />
                    <input type="hidden" name="_template" value="table" />
                    <div className="terminal-form-row2">
                        <label>
                            <div className="label-text">
                                <span className="chev">›</span> nombre
                            </div>
                            <input
                                type="text"
                                name="name"
                                placeholder="tu nombre"
                                className="terminal-input"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </label>
                        <label>
                            <div className="label-text">
                                <span className="chev">›</span> email
                            </div>
                            <input
                                type="email"
                                name="email"
                                placeholder="tu@correo.com"
                                className="terminal-input"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </label>
                    </div>
                    <label>
                        <div className="label-text">
                            <span className="chev">›</span> mensaje
                        </div>
                        <textarea
                            name="message"
                            placeholder="cuéntame del proyecto, stack, plazos…"
                            className="terminal-textarea"
                            rows={6}
                            value={formData.message}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <div className="terminal-form-foot">
                        <div className="terminal-form-hint">
                            <span className="dollar">$</span> envío vía FormSubmit → {email}
                        </div>
                        <button
                            type="submit"
                            className="terminal-form-submit"
                            aria-label="Enviar mensaje"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? './enviando…' : './enviar.sh →'}
                        </button>
                    </div>
                </form>
            </>
        );
    }

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