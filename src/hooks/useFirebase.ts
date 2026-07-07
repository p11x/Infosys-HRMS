import { get, ref, set, push, update, onValue } from 'firebase/database'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../firebase/config'

export const useFirebase = () => {
  const getEmployee = async (uid: string) => {
    try {
      const snapshot = await get(ref(db, `Employees/${uid}`))
      return snapshot.val()
    } catch (error) {
      throw error
    }
  }

  const updateEmployee = async (uid: string, data: any) => {
    try {
      await set(ref(db, `Employees/${uid}`), data)
    } catch (error) {
      throw error
    }
  }

  const getLeaveRequests = async (uid?: string) => {
    try {
      const snapshot = await get(ref(db, 'LeaveRequests'))
      const allRequests = snapshot.val() || {}
      if (uid) {
        const filtered = Object.entries(allRequests).reduce((acc: any, [key, value]: any) => {
          if (value.uid === uid) {
            acc[key] = value
          }
          return acc
        }, {})
        return filtered
      }
      return allRequests
    } catch (error) {
      throw error
    }
  }

  const listenToLeaveRequests = (uid: string, callback: (data: any) => void) => {
    return onValue(ref(db, 'LeaveRequests'), (snapshot) => {
      const allRequests = snapshot.val() || {}
      const filtered = Object.entries(allRequests).reduce((acc: any, [key, value]: any) => {
        if (value.uid === uid) {
          acc[key] = value
        }
        return acc
      }, {})
      callback(filtered)
    })
  }

  const listenToAllLeaveRequests = (callback: (data: any) => void) => {
    return onValue(ref(db, 'LeaveRequests'), (snapshot) => {
      callback(snapshot.val() || {})
    })
  }

  const updateLeaveStatus = async (leaveId: string, status: 'Pending' | 'Approved' | 'Rejected') => {
    try {
      await update(ref(db, `LeaveRequests/${leaveId}`), { status })
    } catch (error) {
      throw error
    }
  }

  const markAttendance = async (uid: string, date: string, checkInTime: string) => {
    try {
      await set(ref(db, `Attendance/${uid}/${date}`), {
        status: 'Present',
        checkInTime,
      })
    } catch (error) {
      throw error
    }
  }

  const listenToAttendance = (uid: string, date: string, callback: (data: any) => void) => {
    return onValue(ref(db, `Attendance/${uid}/${date}`), (snapshot) => {
      callback(snapshot.val())
    })
  }

  const getAllAttendance = async () => {
    try {
      const snapshot = await get(ref(db, 'Attendance'))
      return snapshot.val() || {}
    } catch (error) {
      throw error
    }
  }

  const listenToAllAttendance = (callback: (data: any) => void) => {
    return onValue(ref(db, 'Attendance'), (snapshot) => {
      callback(snapshot.val() || {})
    })
  }

  const getAllUsers = async () => {
    try {
      const snapshot = await get(ref(db, 'Users'))
      return snapshot.val() || {}
    } catch (error) {
      throw error
    }
  }

  const listenToAllUsers = (callback: (data: any) => void) => {
    return onValue(ref(db, 'Users'), (snapshot) => {
      callback(snapshot.val() || {})
    })
  }

  const uploadFile = async (path: string, file: File): Promise<string> => {
    try {
      const fileRef = storageRef(storage, path)
      await uploadBytes(fileRef, file)
      return getDownloadURL(fileRef)
    } catch (error) {
      throw error
    }
  }

  return {
    getEmployee,
    updateEmployee,
    getLeaveRequests,
    listenToLeaveRequests,
    listenToAllLeaveRequests,
    updateLeaveStatus,
    markAttendance,
    listenToAttendance,
    getAllAttendance,
    listenToAllAttendance,
    getAllUsers,
    listenToAllUsers,
    uploadFile,
  }
}