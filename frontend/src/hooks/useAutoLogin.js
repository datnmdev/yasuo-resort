import { useEffect } from 'react'
import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'
import { useDispatch } from 'react-redux'
import { userAction } from '../stores/reducers/userReducer'

export const useAutoLogin = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    const token = Cookies.get('accessToken')
    if (token) {
      try {
        const decoded = jwtDecode(token)
        dispatch(userAction.setUser({
          id: decoded.id,
          role: decoded.role,
          status: decoded.status,
          isSuccess: true
        }))
      } catch (err) {
        console.warn('Token không hợp lệ:', err)
      }
    }
  }, [])
}