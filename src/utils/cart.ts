export class Cart {
    items: [];
  
    constructor(previousCart: any) {
        this.items = previousCart.items || [];
    }
  
    add = function (item: any, id: string) {
        const itemExist = !!this.items.filter((cartItem: any) => cartItem.id === id).length;
  
        if (!itemExist) {
            this.items.push({ item, id, qty: 1 });
        } else {
            this.items.forEach((cartItem: any) => {
                if (cartItem.id === id) {
                    cartItem.qty++;
                }
            });
        }
    }
  
    remove = function (id: string) {
        this.items = this.items.map((cartItem: any) => {
            if (cartItem.id === id && cartItem.qty > 1) {
                cartItem.qty--;
            } else if (cartItem.id === id && cartItem.qty === 1) {
                cartItem = {};
            }
            return cartItem;
        }).filter((cartItem: any) => cartItem.id);
    }
  
    check = function (id: string) {
        return this.items.find((cartItem: any) => cartItem.id === id);
    }
}