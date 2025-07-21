import { cartAction, cartSelector } from '@src/stores/reducers/cartReducer';
import { useDispatch, useSelector } from 'react-redux';

export function useCart() {
    const dispatch = useDispatch();
    const cart = useSelector(cartSelector.selectCart);
    const booking = useSelector(cartSelector.booking);

    const setBooking = (booking) => dispatch(cartAction.setBooking(booking));
    const add = (service) => dispatch(cartAction.addToCart(service));
    const remove = (uuid) => dispatch(cartAction.removeFromCart(uuid));
    const clear = () => dispatch(cartAction.clearCart());

    return { cart, booking, setBooking, add, remove, clear };
}
