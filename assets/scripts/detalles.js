const {createApp} = Vue;

createApp ( {
    data (){
        return {
            productosOrig: [],
            productosModif: [],
            producto: undefined,
            productosCarrito: [],
            productosPromo3x2: [],
            
        }
    },
    created(){
        let urlString = location.search;
        let parameters = new URLSearchParams(urlString);
        let id = parameters.get('id');

        fetch('https://mindhub-xj03.onrender.com/api/petshop')
            .then(resolve => resolve.json())
            .then(datosAPI => {
                this.productosOrig = [... datosAPI];
                this.productosModif = this.productosOrig.map(prod => {
                    return {
                        ...prod,
                        cantPedida: 0,
                        subtotal: 0,
                        descuento: 0,
                        total: 0,
                    }
                })
                this.productosCarrito = JSON.parse(localStorage.getItem('carrito')) || [];
                this.actualizarStockDeLocalStorage();
                this.producto = this.productosModif.find( prod => prod._id === id);
                

            })
            //.catch(err => console.error(err.message));
    },

    methods: {

        actualizarStockDeLocalStorage: function() {

            if(this.productosCarrito.length) {
                for(let producto of this.productosModif) {
                    for(let prodCarro of this.productosCarrito) {
                        if(prodCarro._id === producto._id) {
                            producto.disponibles = prodCarro.disponibles;
                            producto.cantPedida = prodCarro.cantPedida;
                            producto.subtotal = prodCarro.subtotal;
                            producto.descuento = prodCarro.descuento;
                            producto.total = prodCarro.total;
                        }

                    }
                }
            }
        },

        quitarDesdeCarrito: function(producto) {

            producto = this.actualizacionDePropiedades(producto, -1);

            for(prod of this.productosCarrito) {
                if(producto._id == prod._id) {
                    !producto.cantPedida? delete this.productosCarrito[this.productosCarrito.indexOf(prod)]
                                        : Object.assign(producto, this.producto);    
                }
            }
            localStorage.setItem('carrito', JSON.stringify(this.productosCarrito));
        },


        agregarDesdeCarrito: function(producto) {

            producto = this.actualizacionDePropiedades(producto, 1);
    
            if(!this.productosCarrito.some(prod => this.producto._id == prod._id)){
                this.productosCarrito.push(this.producto);
            }
            else {

                for(producto of this.productosCarrito) {
                    if(this.producto._id == producto._id) {

                        Object.assign(producto, this.producto);
                    }
                }
            }
            localStorage.setItem('carrito', JSON.stringify(this.productosCarrito));
        },


        agregarCarritoPorBoton: function() {

            this.producto = this.actualizacionDePropiedades(this.producto, 1);
    
            if(!this.productosCarrito.some(prod => this.producto._id == prod._id)){
                this.productosCarrito.push(this.producto);
            }
            else {

                for(producto of this.productosCarrito) {
                    if(this.producto._id == producto._id) {

                        Object.assign(producto, this.producto);
                    }
                }
            }
            localStorage.setItem('carrito', JSON.stringify(this.productosCarrito));
        },

        actualizacionDePropiedades(prodAVender, acumulador) {

            prodAVender.disponibles -= acumulador;
            prodAVender.cantPedida += acumulador;

            if(prodAVender.cantPedida >= 3) {
                prodAVender.descuento = ((prodAVender.cantPedida / 3 ) * prodAVender.precio).toFixed(2);
            }
            prodAVender.subtotal = prodAVender.cantPedida * prodAVender.precio;
            prodAVender.total = prodAVender.subtotal - prodAVender.descuento;

            return prodAVender;
        },


    }

}).mount('#app')

