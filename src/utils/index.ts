/*
import { ICart } from '../cart.original/interfaces/cart.interface';
import { IProduct } from '../product/interfaces/product.interface';

export const prepareProduct = (product): IProduct => ({
    _id: product._id,
    code: product.code,
    type: product.type,
    name: product.name,
    slug: product.slug,
    visibility: product.visibility, 
    topic: product.topic,
    image_url: product.image_url,
    video_url: product.video_url,
    headline: product.headline,
    description: product.description,
    feedback: product.feedback,
    time_period: product.time_period,
    price: product.price,
    on_sale: product.on_sale,
    sale_price: product.sale_price,
    boe: product.boe,
    sale_method: product.sale_method,
    product_redirect: product.product_redirect,
    agent: product.agent,
    image_bonus_url: product.image_bonus_url,
    image_text_url: product.image_text_url,
    image_product_url: product.image_product_url,
    section: product.section,
    feature: product.feature,
    bump: product.bump,
    created_at: product.created_at,
    updated_at: product.updated_at,
    ...product
});

export const prepareCart = (cart): ICart => {
    const cartItems = cart.items.map((cart: any) => {
        const prepareItem = prepareProduct(cart.item);
        // const price: number = prepareItem.on_sale ? prepareItem.sale_price : prepareItem.price;
        const price: number = prepareItem.sale_price !== 0 ? prepareItem.sale_price : prepareItem.price;
        return { item: prepareItem, id: cart.id, qty: cart.qty, price }
    }).filter((cart: any) => cart.item.visibility === 'publish');

    const { total_price, total_qty }: { total_price: number; total_qty: number } = cartItems.reduce(
        (prev, item) => ({
            total_price: prev.total_price + item.price * item.qty,
            total_qty: prev.total_qty + item.qty,
        }),
        { total_price: 0, total_qty: 0 }
    );

    return {
        items: cartItems,
        total_price: total_price,
        total_qty
    }
}
*/