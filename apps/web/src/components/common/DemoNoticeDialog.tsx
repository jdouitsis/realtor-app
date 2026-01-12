import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui'
import { useStorage } from '@/lib/storage'

export function DemoNoticeDialog() {
  const [dismissed, setDismissed] = useStorage('demo_notice_dismissed')

  const handleDismiss = () => {
    setDismissed(true)
  }

  return (
    <Dialog open={!dismissed} onOpenChange={(open) => !open && handleDismiss()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to Realtor App</DialogTitle>
          <DialogDescription className="pt-2 leading-relaxed">
            This site is currently a conceptual preview. What you're seeing is sample data and
            prototype functionality designed to demonstrate how Realtor App will work once we reach
            our first official release.
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          We're excited to share our vision with you. Feel free to explore and imagine what's
          possible!
        </p>
        <DialogFooter className="pt-2">
          <Button onClick={handleDismiss}>Got it, let's explore</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
