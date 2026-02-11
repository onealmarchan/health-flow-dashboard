import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from './ConfirmDialog';

interface ModalFormButtonsProps {
  onSave: () => void;
  onSaveAndAnother: () => void;
  onCancel: () => void;
  saving?: boolean;
}

export function ModalFormButtons({ onSave, onSaveAndAnother, onCancel, saving }: ModalFormButtonsProps) {
  const [confirmAction, setConfirmAction] = useState<'save' | 'saveAnother' | 'cancel' | null>(null);

  const handleConfirm = () => {
    if (confirmAction === 'save') onSave();
    else if (confirmAction === 'saveAnother') onSaveAndAnother();
    else if (confirmAction === 'cancel') onCancel();
    setConfirmAction(null);
  };

  return (
    <>
      <div className="flex gap-2 justify-end pt-4 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={() => setConfirmAction('cancel')}
          disabled={saving}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setConfirmAction('saveAnother')}
          disabled={saving}
        >
          Guardar y Otra
        </Button>
        <Button
          type="button"
          onClick={() => setConfirmAction('save')}
          disabled={saving}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Guardar
        </Button>
      </div>

      <ConfirmDialog
        open={confirmAction !== null}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        onConfirm={handleConfirm}
        title="¿Estás seguro?"
        description={
          confirmAction === 'cancel'
            ? 'Se perderán los cambios no guardados.'
            : 'Se guardarán los datos ingresados.'
        }
      />
    </>
  );
}
