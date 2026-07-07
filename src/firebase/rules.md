{
  "rules": {
    "Users": {
      "$uid": {
        ".read": "$uid === auth.uid || root.child('Users').child(auth.uid).child('role').val() === 'admin'",
        ".write": "$uid === auth.uid || root.child('Users').child(auth.uid).child('role').val() === 'admin'"
      }
    },
    "Employees": {
      "$uid": {
        ".read": "$uid === auth.uid || root.child('Users').child(auth.uid).child('role').val() === 'admin'",
        ".write": "$uid === auth.uid || root.child('Users').child(auth.uid).child('role').val() === 'admin'"
      }
    },
    "LeaveRequests": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "Attendance": {
      "$uid": {
        ".read": "$uid === auth.uid || root.child('Users').child(auth.uid).child('role').val() === 'admin'",
        ".write": "$uid === auth.uid || root.child('Users').child(auth.uid).child('role').val() === 'admin'"
      }
    },
    "Announcements": {
      ".read": "auth != null",
      ".write": "root.child('Users').child(auth.uid).child('role').val() === 'admin'"
    },
    "Holidays": {
      ".read": "auth != null",
      ".write": "root.child('Users').child(auth.uid).child('role').val() === 'admin'"
    },
    "SupportTickets": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "AuditLog": {
      ".read": "root.child('Users').child(auth.uid).child('role').val() === 'admin'",
      ".write": "auth != null"
    },
    "LeaveBalance": {
      "$uid": {
        ".read": "$uid === auth.uid || root.child('Users').child(auth.uid).child('role').val() === 'admin'",
        ".write": "root.child('Users').child(auth.uid).child('role').val() === 'admin'"
      }
    }
  }
}