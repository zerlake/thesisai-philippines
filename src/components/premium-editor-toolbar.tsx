'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import {
  Glassmorphic,
  IconButton,
  StarIcon,
  CheckIcon,
  ArrowIcon,
  PlusIcon,
  CloseIcon,
  AdvancedLighting,
} from '@/lib/visual-effects'

/**
 * Premium Editor Toolbar
 * Sophisticated toolbar for editor interfaces with glassmorphism
 */
export const PremiumEditorToolbar: React.FC<{
  className?: string
}> = ({ className }) => {
  return (
    <Glassmorphic
      intensity="strong"
      variant="dark"
      border={false}
      className={cn(
        'fixed top-0 left-0 right-0 z-40',
        'border-b border-white/10',
        'px-4 py-3 sm:px-6',
        className
      )}
    >
      {/* Subtle background lighting */}
      <AdvancedLighting />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-between max-w-full">
        {/* Left: Document info */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
            <StarIcon size={16} className="text-primary" />
          </div>
          <div>
            <p className="text-xs text-foreground/60">Document</p>
            <p className="text-sm font-semibold text-foreground">Untitled</p>
          </div>
        </div>

        {/* Center: Format buttons */}
        <div className="hidden sm:flex items-center gap-1 bg-black/20 rounded-lg p-1">
          {[
            { icon: <StarIcon size={16} />, label: 'Bold' },
            { icon: <CheckIcon size={16} />, label: 'Italic' },
            { icon: <ArrowIcon size={16} />, label: 'Underline' },
          ].map((btn, i) => (
            <IconButton
              key={i}
              icon={btn.icon}
              variant="ghost"
              size="sm"
              className="text-foreground/70 hover:text-foreground"
            />
          ))}
        </div>

        {/* Right: Action buttons */}
        <div className="flex items-center gap-2">
          <IconButton
            icon={<PlusIcon size={16} />}
            variant="subtle"
            size="sm"
            className="text-foreground/70 hover:text-foreground"
          />
          <IconButton
            icon={<CheckIcon size={16} />}
            variant="subtle"
            size="sm"
            className="text-green-500 hover:text-green-400"
          />
          <IconButton
            icon={<CloseIcon size={16} />}
            variant="ghost"
            size="sm"
            className="text-foreground/70 hover:text-foreground"
          />
        </div>
      </div>
    </Glassmorphic>
  )
}

/**
 * Premium Floating Toolbar
 * For context-specific actions within editor
 */
export const PremiumFloatingToolbar: React.FC<{
  actions: Array<{
    icon: React.ReactNode
    label: string
    onClick?: () => void
  }>
  position?: 'top' | 'bottom'
}> = ({ actions, position = 'top' }) => {
  return (
    <Glassmorphic
      intensity="strong"
      variant="light"
      className={cn(
        'fixed z-50',
        'left-1/2 -translate-x-1/2',
        position === 'top' ? 'top-20' : 'bottom-20',
        'px-2 py-1',
        'flex items-center gap-1',
        'shadow-2xl'
      )}
    >
      <AdvancedLighting />

      <div className="relative z-10 flex items-center gap-2">
        {actions.map((action, i) => (
          <IconButton
            key={i}
            icon={action.icon}
            onClick={action.onClick}
            variant="ghost"
            size="sm"
            className="text-foreground/70 hover:text-foreground hover:bg-black/10"
          />
        ))}
      </div>
    </Glassmorphic>
  )
}

/**
 * Premium Sidebar with Glassmorphism
 */
export const PremiumEditorSidebar: React.FC<{
  title: string
  children: React.ReactNode
}> = ({ title, children }) => {
  return (
    <Glassmorphic
      intensity="medium"
      variant="dark"
      border
      className="h-full overflow-y-auto"
    >
      <AdvancedLighting />

      <div className="relative z-10 p-4">
        <h3 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wide">
          {title}
        </h3>
        {children}
      </div>
    </Glassmorphic>
  )
}
