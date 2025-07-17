// src/hooks/useNotification.ts
import { useState, useCallback, useEffect } from 'react'
import { Notification, NotificationAction } from '../types'

interface NotificationConfig {
  duration?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  maxNotifications?: number
  enableSound?: boolean
  enableBrowserNotification?: boolean
}

const defaultConfig: NotificationConfig = {
  duration: 5000,
  position: 'top-right',
  maxNotifications: 5,
  enableSound: false,
  enableBrowserNotification: false
}

export const useNotification = (config: NotificationConfig = {}) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const mergedConfig = { ...defaultConfig, ...config }

  // Solicitar permissão para notificações do navegador
  useEffect(() => {
    if (mergedConfig.enableBrowserNotification && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission()
      }
    }
  }, [mergedConfig.enableBrowserNotification])

  const addNotification = useCallback((
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message?: string,
    actions?: NotificationAction[],
    customDuration?: number
  ) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    
    const notification: Notification = {
      id,
      type,
      title,
      message: message || '',
      timestamp: new Date().toISOString(),
      read: false,
      actions
    }

    setNotifications(prev => {
      const newNotifications = [notification, ...prev].slice(0, mergedConfig.maxNotifications!)
      return newNotifications
    })

    // Auto-remove notification
    const duration = customDuration ?? mergedConfig.duration!
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }

    // Som de notificação
    if (mergedConfig.enableSound) {
      playNotificationSound(type)
    }

    // Notificação do navegador
    if (mergedConfig.enableBrowserNotification && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: getNotificationIcon(type),
        tag: id
      })
    }

    return id
  }, [mergedConfig])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  const clearByType = useCallback((type: 'success' | 'error' | 'warning' | 'info') => {
    setNotifications(prev => prev.filter(n => n.type !== type))
  }, [])

  // Shortcuts para tipos específicos
  const success = useCallback((title: string, message?: string, actions?: NotificationAction[], duration?: number) => {
    return addNotification('success', title, message, actions, duration)
  }, [addNotification])

  const error = useCallback((title: string, message?: string, actions?: NotificationAction[], duration?: number) => {
    return addNotification('error', title, message, actions, duration)
  }, [addNotification])

  const warning = useCallback((title: string, message?: string, actions?: NotificationAction[], duration?: number) => {
    return addNotification('warning', title, message, actions, duration)
  }, [addNotification])

  const info = useCallback((title: string, message?: string, actions?: NotificationAction[], duration?: number) => {
    return addNotification('info', title, message, actions, duration)
  }, [addNotification])

  // Notificações específicas do sistema
  const notifyDataSaved = useCallback((entityName: string = 'dados') => {
    success('Dados Salvos', `${entityName} salvos com sucesso!`)
  }, [success])

  const notifyDataDeleted = useCallback((entityName: string = 'item') => {
    success('Item Removido', `${entityName} removido com sucesso!`)
  }, [success])

  const notifyError = useCallback((operation: string, details?: string) => {
    error('Erro na Operação', `Erro ao ${operation}${details ? `: ${details}` : ''}`)
  }, [error])

  const notifyNetworkError = useCallback(() => {
    error('Erro de Conexão', 'Verifique sua conexão com a internet')
  }, [error])

  const notifyValidationError = useCallback((field: string) => {
    warning('Dados Inválidos', `Por favor, verifique o campo: ${field}`)
  }, [warning])

  const notifyBackupComplete = useCallback(() => {
    success('Backup Concluído', 'Backup dos dados realizado com sucesso!')
  }, [success])

  const notifyNewMessage = useCallback((from: string, preview: string) => {
    info('Nova Mensagem', `${from}: ${preview}`, [
      {
        label: 'Ver',
        action: () => console.log('Abrir mensagem'),
        variant: 'primary'
      }
    ])
  }, [info])

  const notifyFollowUpReminder = useCallback((clientName: string, date: string) => {
    warning('Follow-up Pendente', `Cliente ${clientName} - ${date}`, [
      {
        label: 'Marcar como Feito',
        action: () => console.log('Marcar follow-up como feito'),
        variant: 'success'
      },
      {
        label: 'Adiar',
        action: () => console.log('Adiar follow-up'),
        variant: 'secondary'
      }
    ])
  }, [warning])

  const notifyPaymentOverdue = useCallback((amount: string, days: number) => {
    error('Pagamento Vencido', `${amount} vencido há ${days} dia(s)`, [
      {
        label: 'Marcar como Pago',
        action: () => console.log('Marcar como pago'),
        variant: 'success'
      }
    ])
  }, [error])

  const notifyAppointmentReminder = useCallback((clientName: string, time: string) => {
    info('Lembrete de Agendamento', `${clientName} às ${time}`, [
      {
        label: 'Confirmar',
        action: () => console.log('Confirmar agendamento'),
        variant: 'primary'
      }
    ])
  }, [info])

  // Estatísticas
  const unreadCount = notifications.filter(n => !n.read).length
  const getCountByType = (type: 'success' | 'error' | 'warning' | 'info') => 
    notifications.filter(n => n.type === type).length

  return {
    notifications,
    unreadCount,
    
    // Operações básicas
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    clearByType,
    
    // Shortcuts
    success,
    error,
    warning,
    info,
    
    // Notificações específicas
    notifyDataSaved,
    notifyDataDeleted,
    notifyError,
    notifyNetworkError,
    notifyValidationError,
    notifyBackupComplete,
    notifyNewMessage,
    notifyFollowUpReminder,
    notifyPaymentOverdue,
    notifyAppointmentReminder,
    
    // Estatísticas
    getCountByType,
    
    // Configuração
    config: mergedConfig
  }
}

// Funções utilitárias
const playNotificationSound = (type: 'success' | 'error' | 'warning' | 'info') => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  
  const frequencies: Record<string, number[]> = {
    success: [523.25, 659.25, 783.99], // C5, E5, G5
    error: [329.63, 293.66], // E4, D4
    warning: [440, 493.88], // A4, B4
    info: [523.25, 587.33] // C5, D5
  }

  const notes = frequencies[type]
  
  notes.forEach((frequency, index) => {
    setTimeout(() => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
    }, index * 100)
  })
}

const getNotificationIcon = (type: 'success' | 'error' | 'warning' | 'info'): string => {
  const icons = {
    success: '/icons/success.png',
    error: '/icons/error.png',
    warning: '/icons/warning.png',
    info: '/icons/info.png'
  }
  
  return icons[type] || '/icons/default.png'
}

// Hook para notificações persistentes
export const usePersistentNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      const stored = localStorage.getItem('persistent_notifications')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('persistent_notifications', JSON.stringify(notifications))
  }, [notifications])

  const addPersistentNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    }
    
    setNotifications(prev => [newNotification, ...prev])
    return newNotification.id
  }, [])

  const removePersistentNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearPersistentNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  return {
    persistentNotifications: notifications,
    addPersistentNotification,
    removePersistentNotification,
    clearPersistentNotifications
  }
}

// Hook para notificações baseadas em eventos do sistema
export const useSystemNotifications = () => {
  const { notifyError, notifyNetworkError, notifyDataSaved } = useNotification()

  useEffect(() => {
    // Detectar erros globais
    const handleError = (event: ErrorEvent) => {
      notifyError('Erro do Sistema', event.message)
    }

    // Detectar problemas de rede
    const handleOnline = () => {
      notifyDataSaved('Conexão restaurada')
    }

    const handleOffline = () => {
      notifyNetworkError()
    }

    // Detectar problemas de Promise rejeitadas
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      notifyError('Erro Inesperado', 'Ocorreu um erro inesperado no sistema')
    }

    window.addEventListener('error', handleError)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [notifyError, notifyNetworkError, notifyDataSaved])
}
