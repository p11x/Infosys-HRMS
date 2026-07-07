import type { UserModel } from '../types'

interface ProfileCompletionProps {
  employee: UserModel | null
}

export const ProfileCompletion = ({ employee }: ProfileCompletionProps) => {
  const calculateCompletion = () => {
    if (!employee) return 0

    let completed = 0
    if (employee.name || employee.phone || employee.email) completed += 25
    if (employee.profilePhoto) completed += 25
    if (employee.dob) completed += 25
    if (employee.address && employee.gender) completed += 25

    return completed
  }

  const percentage = calculateCompletion()

  return (
    <div className="mb-4">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Profile Completion</span>
        <span className="text-sm font-medium text-primary">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}