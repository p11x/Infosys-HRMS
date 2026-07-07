import { ChevronRight } from 'lucide-react'

interface SectionCardProps {
  icon: React.ReactNode
  title: string
  subtitle: string
  onClick: () => void
}

export const SectionCard = ({ icon, title, subtitle, onClick }: SectionCardProps) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow w-full"
    >
      <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full">
        {icon}
      </div>
      <div className="flex-1 ml-4 text-left">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
      <ChevronRight size={20} className="text-gray-400" />
    </button>
  )
}