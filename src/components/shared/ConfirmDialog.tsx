interface ConfirmDialogProps {
    title?: string;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
    isOpen: boolean;
    close: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    title = "Confirmación",
    message,
    onConfirm,
    onCancel,
    isOpen,
    close,
}) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.30)' }}
        >
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl text-black font-semibold">{title}</h2>
                <p className="mt-2 text-black">{message}</p>
                <div className="flex justify-end mt-4 space-x-2">
                    <button
                        onClick={() => {
                            onCancel?.();
                            close();
                        }}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 cursor-pointer"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            close();
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};
