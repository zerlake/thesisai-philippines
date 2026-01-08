'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { submitTestimonial, type TestimonialData } from '@/actions/testimonials'
import { toast } from 'sonner'
import { Heart, Loader2 } from 'lucide-react'

interface TestimonialRequestModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  planType: 'pro' | 'pro_advisor' | 'pro_complete'
}

export function TestimonialRequestModal({
  isOpen,
  onClose,
  onSuccess,
  planType
}: TestimonialRequestModalProps) {
  const [formData, setFormData] = useState<TestimonialData>({
    content: '',
    full_name: '',
    course: '',
    institution: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.content.trim() || !formData.full_name.trim() || !formData.course.trim() || !formData.institution.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    setIsSubmitting(true)

    try {
      const result = await submitTestimonial(formData)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Thank you for your feedback!')
        onSuccess?.()
        onClose()
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            Share Your Success Story
          </DialogTitle>
          <DialogDescription>
            {planType === 'pro'
              ? "Congratulations on finishing your draft! How has ThesisAI helped you reach this milestone?"
              : "Your draft is on its way to your advisor! How has ThesisAI helped you get this far?"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="content">Your Experience</Label>
            <Textarea
              id="content"
              placeholder="e.g. ThesisAI helped me overcome writer's block andstructure my arguments..."
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              placeholder="John Doe"
              value={formData.full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course">Course/Major</Label>
              <Input
                id="course"
                placeholder="Computer Science"
                value={formData.course}
                onChange={(e) => setFormData(prev => ({ ...prev, course: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="institution">Institution</Label>
              <Input
                id="institution"
                placeholder="University Name"
                value={formData.institution}
                onChange={(e) => setFormData(prev => ({ ...prev, institution: e.target.value }))}
                required
              />
            </div>
          </div>

          <DialogFooter className="sm:justify-between items-center gap-4 pt-4">
             <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Maybe Later
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit Testimonial
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
