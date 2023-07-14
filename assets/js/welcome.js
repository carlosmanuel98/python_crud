$( document ).ready(function() {
    // const URL = "http://127.0.0.1:5000/"
    const URL = "https://cmrojas98.pythonanywhere.com/"
    // console.log(URL)

    var table = $('#listaProductos').DataTable({
        dom: '<"row"<"col-md-10 p-0"f><"col-md-2"B>rtip>',
        processing: true,
        buttons: [
            // {
            //     text: '<i class="fa-light fa-plus"></i>',
            //     titleAttr: 'Agregar nuevo producto',
            //     className: 'btn btn-info btn-sm text-white',
            //     attr: {
            //         'aria-controls': 'add-btn'
            //       },
            // },
            {
                extend: 'excelHtml5',
                text: '<i class="fa-sharp fa-solid fa-file-excel"></i>',
                titleAttr: 'Exportar a Excel',
                className: 'btn btn-success btn-sm'
            },
            {
                extend: 'pdfHtml5',
                text: '<i class="fa-solid fa-file-pdf"></i>',
                titleAttr: 'Exportar a Pdf',
                className: 'btn btn-danger btn-sm'
            }
            
        ],
        ajax: {
            url: "https://cmrojas98.pythonanywhere.com/productos",
            dataSrc: ""
            // . Esto se debe a que DataTables espera que los datos devueltos por la URL sean un objeto JSON en lugar de un array. Al especificar dataSrc: "", indicamos que los datos están en la raíz del objeto JSON devuelto.
        },
        columns: [
            {
            render: function (data, type) {
                return ` 
                <button type="button" class="btn btn-warning btn-sm edit"><i class="fa-solid fa-pen-to-square"></i></button>
                <button type="button" class="btn btn-danger btn-sm delete"><i class="fa-solid fa-trash-can"></i></button>`
            },
            },
            {data: 'codigo'},
            {data: 'descripcion'},
            {data: 'cantidad'},
            {data: 'precio'},

        ],
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json',
        },
    });

    $('body')
    .on('click', 'button[aria-controls="add-btn"]', function () {
        const rutaArchivoHTML = 'new_producto.html';
        // Hacer la solicitud para obtener el contenido HTML del archivo
        fetch(rutaArchivoHTML)
        .then(response => response.text())
        .then(html => {
            $('.new-modal').remove();
            $('body').append('<div class="new-modal">');
            let div = $('.new-modal')
            div.append(html)
            $('#new-product').modal('show');

        })
        .catch(error => {
        console.error('Error al cargar el archivo HTML:', error);
        });
    })
    // Crea nuevo Producto-----------
    .on('click', 'button.new-product', function (event) {
        event.preventDefault(); // Evitar que se envíe el formulario por defecto
       ;
        let form = document.getElementById('form-new-product');
        let formData = new FormData(form);
        let objeto_producto = {
            codigo: formData.get('codigo'),
            descripcion: formData.get('descripcion'),
            cantidad: formData.get('cantidad'),
            precio: formData.get('precio')
        }
       
        if( !$('#form-new-product').valid() ) return

        fetch(URL + 'productos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(objeto_producto)
        })
        .then(function (response) {
          
            // Código para manejar la respuesta
            if (response.ok) {
                return response.json(); // Parseamos la respuesta JSON
            } else {
                return response.json()
                .then(function (error) {
                    console.log(error); // Aquí se imprime el mensaje de error capturado
                    throw new Error(error.message);
                });
                // Si hubo un error, lanzar explícitamente una excepción
                // para ser "catcheada" más adelante
                
                // throw new Error('Error al agregar el producto.x');
            }
        })
        .then(function (data) {

            // alert('Producto agregado correctamente.');
            // table.ajax.reload();
            Swal.fire(
                'Producto creado!',
                ' ',
                'success'
                )
            table.ajax.reload( null, false ); // user paging is not reset on reload
            $('#new-product').modal('hide');
        })
        .catch(function (error) {
            Swal.fire({
                icon: 'error',
                title: 'Disculpe...',
                text: error.message,
              })
            // Código para manejar errores
            // alert('Error al agregar el producto.X');
        });
    })
    // Mostrar detalle producto--------EDITAR
    .on('click', 'tr button.edit', function () {
        let tr =  $(this).closest('tr');
        let data = table.row(tr).data();
        // // Hacer la solicitud para obtener el contenido HTML del archivo
        let rutaArchivoHTMLEdit = 'edit_producto.html';
            // Hacer la solicitud para obtener el contenido HTML del archivo
            fetch(rutaArchivoHTMLEdit)
            .then(response => response.text())
            .then(html => {
                $('.edit-modal').remove();
                $('body').append('<div class="edit-modal">');
                let div = $('.edit-modal')
                div.append(html)
                $('#edit-product').modal('show');

            })
           

        fetch(URL + 'productos/' + data.codigo)
        .then(response => {
            if (response.ok) {       
                return response.json()
            } else {
                // throw new Error('Error al obtener los datos del producto.')
                return response.json()
                .then(function (error) {
                    console.log(error); // Aquí se imprime el mensaje de error capturado
                    throw new Error(error.message);
                });
            }
        })
        .then(data => {
           
           
            // SETEA VALUES
            console.log("DATA",data)
            $("#form-edit-product #codigo").val(data.codigo)
            $("#form-edit-product #cantidad").val(data.cantidad)
            $("#form-edit-product #descripcion").val(data.descripcion)
            $("#form-edit-product #precio").val(data.precio)
            
        })
        .catch(error => {
            Swal.fire({
                icon: 'error',
                title: 'Disculpe...',
                text: error.message,
              })
        })
        .catch(error => {
            console.error('Error al cargar el archivo HTML:', error);
        });
        
    })

    // UPDATE Producto-----------
    .on('click', 'button.update-product', function (event) {
        event.preventDefault(); // Evitar que se envíe el formulario por defecto
        let form = document.getElementById('form-edit-product');
        let formData = new FormData(form);
        console.log("formData.get('codigo')",formData.get('codigo'))
        let objeto_producto = {
            codigo: $("#form-edit-product #codigo").val(),
            descripcion: formData.get('descripcion'),
            cantidad: formData.get('cantidad'),
            precio: formData.get('precio')
        }
       
        if( !$('#form-edit-product').valid() ) return

        fetch(URL + 'productos/' + objeto_producto.codigo, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(objeto_producto)
        })
            .then(response => {
                if (response.ok) {
                    return response.json()
                } else {
                    throw new Error('Error al guardar los cambios del producto.')
                }
            })
            .then(data => {
                Swal.fire(
                    'Producto Actualizado con éxito!',
                    ' ',
                    'success'
                    )
                    .then((result) => {
                        if (result.isConfirmed) {
                            console.log(result)
                            table.ajax.reload( null, false ); // user paging is not reset on reload
                            $('#edit-product').modal('hide');
                            
                        }
                    })
                // location.reload()

            })
            .catch(error => {
                alert('Error al guardar los cambios del producto.')
            })
    })
  
    .on('click', 'tr button.delete', function () {
        let tr =  $(this).closest('tr');
        let data = table.row(tr).data();
        console.log(data)
        console.log("ENTRA: delete")

        Swal.fire({
            title: '¿Desea eliminar este producto?',
            text: " ",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si'
          }).then((result) => {
            if (result.isConfirmed) {
                fetch(URL + `productos/${data.codigo}`, { method: 'DELETE' })
                .then(response => {
                    if (response.ok) {
                        // Eliminar el producto de la lista después de eliminarlo en el servidor
                        // this.productos = this.productos.filter(producto => producto.codigo !== codigo);
                        // console.log('Producto eliminado correctamente.');
        
        
                        table.ajax.reload( null, false ); // user paging is not reset on reload
            
                    } else {
                        // Si hubo un error, lanzar explícitamente una excepción
                        // para ser "catcheada" más adelante
                        throw new Error('Error al eliminar el producto.');
                    }
                })
                .catch(error => {
                    // Código para manejar errores
                    alert('Error al eliminar el producto.');
                });
                
              Swal.fire(
                'Eliminado con éxito!',
                'Producto eliminado.',
                'success'
              )
            }
          })

       
    })
   
   
});
