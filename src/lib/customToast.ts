import { toast } from "sonner";

export const showToast = (message: string, type?: 'success' | 'danger' | 'normal') => {
    switch (type) {
        case 'success':
            toast.success(message, {
                duration: 2000,
                position: 'top-right',
                style: {
                    backgroundColor: '#e24799',
                    borderColor: '#e24799',
                    color: '#fff',
                }
            });
            break;
        case 'danger':
            toast.error(message, {
                duration: 2000,
                position: 'top-right',
                style:{
                    backgroundColor: '#fb2c36',
                    borderColor: '#fb2c36',
                    color: '#fff',
                }
            });
            break;
        default:
            toast.info(message, {
                duration: 2000,
                position: 'top-right',
            });
            break;
    }
};