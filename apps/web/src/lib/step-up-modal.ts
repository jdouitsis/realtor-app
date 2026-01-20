import { create } from 'zustand'

interface StepUpModalState {
  isOpen: boolean
  open: () => void
  close: () => void
}

/**
 * Global store for step-up OTP modal visibility.
 *
 * @example
 * // In React components:
 * const { isOpen, open, close } = useStepUpModal()
 *
 * // Outside React (e.g., query.ts):
 * showStepUpModal()
 */
export const useStepUpModal = create<StepUpModalState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}))

/**
 * Opens the step-up OTP modal from outside React.
 * Used by query.ts error handlers.
 *
 * @example
 * showStepUpModal()
 */
export const showStepUpModal = () => useStepUpModal.getState().open()
