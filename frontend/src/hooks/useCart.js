import { cartAction, cartSelector } from '@src/stores/reducers/cartReducer'
import { useDispatch, useSelector } from 'react-redux'
export function useCart() {
    const dispatch = useDispatch()
    const cart = useSelector(cartSelector.selectCart)

    const add = (service) => dispatch(cartAction.addToCart(service))
    const remove = (id) => dispatch(cartAction.removeFromCart(id))
    const update = (id, change) => dispatch(cartAction.updateQuantity({ id, change }))
    const clear = () => dispatch(cartAction.clearCart())

    return { cart, add, remove, update, clear }
}
