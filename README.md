![image](/src/public/img/demo.PNG)
# BackEnd I - Entrega TP3 (Conclusivo)
## _Servidor con endpoints y servicios para gestionar los productos y carritos de compra de un e-commerce integrando vistas Handlebars, websocket y BD._  
  
### Vista previa / Preview
![image](/src/public/img/demo.gif)

### Depliegue / Deploy
[BackEnd I Entrega TP3 (Conclusivo)](https://ecommbackend1b.netlify.app/) (No disponible por el momento.)

### Descripcion / Description
Aplicativo Backend para e-commerce realizado en javascript, express, Handlebars, websocket y BD para el curso de Backend I en CoderHouse.  


### Construccion / Building
-  Javascript
-  node

# Install nodejs and verify version
   - Install node (recommended version LTS)
   - node --version
   - npm --version

### Dependecias / Dependencies
-  express
-  express-handlebars
-  socket.io
-  moment
-  mongoose
-  mongoose-paginate-v2
-  multer

## Instalacion / Installation
### Pasos / Steps
- Abrir VS Code / Open Vs Code
- Clonar repositorio / Clone Repository
   -  **git clone https://github.com/Tincho83/FullStack_4aBackEnd_I_TP3.git**
   o  
   -  **git clone git@github.com:Tincho83/FullStack_4aBackEnd_I_TP3.git** 

- Acceder a la carpeta del proyecto / Access to project folder
   - **cd FullStack_4aBackEnd_I_TP3**

- Instalar todas las dependecias del proyecto/ Install dependencies
   - **npm install**
   o instalar dependencias individualmente
   - **npm install express**
   - **npm install express-handlebars@7.1.3**
   - **npm install moment**
   - **npm install mongoose**
   - **npm install socket.io**
   - **npm install mongoose-paginate-v2**
   - **npm install multer**
   
- Instalar otras herramientas / Install others tools
   - **npm install -g nodemon** (instala nodemon de manera global. Esta herramienta reinicia el servidor cuando detecta cambios en el codigo.)
   
- Compilar / Compile
   - **npm run dev** (Para ejecutar en modo desarrollo)
   - **npm run start** (Para ejecutar en modo produccion)

### Estructura del proyecto / Project structure

#### Carpeta raiz del proyecto
   -  **node_modules** (No disponible en el repositorio, aparecera cuando instalen las dependencias del   proyecto.)
   -  **src** (Carpeta que contiene los fuentes del proyecto)
   -  **.gitignore** (No disponible en el Repositorio. Solo para uso de git. Crear archivo .gitignore y agregar el texto (sin comillas): "node_modules" )
   -  **nodemon.json**  (Utilizado por nodemon. Contiene la exclusion del monitoreo a archivos ".json" para evitar reiniciar el servidor cuando detecta cambios en estas extensiones de archivo.)
   -  **package.json** (Informacion y configuracion del proyecto. Se genera cuando se ejecuta el comando "npm init -y")
   -  **Readme.md** (Este archivo)   
      

#### Carpeta "src"
   - **config** contiene las rutas para los endpoints
         - **config.js** contiene en variables informacion a usar en la aplicacion.
   -  **dao** (Data Access Object, contiene los administradores para acceso a datos):
      -  **db** (Administradores para acceso a datos de BBDD):
            - **CartsManagerMongoDB.js** (Administrador de acceso a datos para ABM del carrito.)
            - **MessagesManagerMongoDB.js**  (Administrador de acceso a datos de mensajeria.)
            - **ProductsManagerMongoDB.js**  (Administrador de acceso a datos para ABM de los productos.)
      -  **filesystem** (Administradores para acceso a datos en archivos .json):
            - **CartsManager.js** (Administrador de acceso a datos para ABM del carrito.)            
            - **ProductsManager.js**  (Administrador de acceso a datos para ABM de los productos.)
      -  **models** (Esquema de modelo para acceso a datos en DDBB):
            - **CartsModel.js** (Esquema de modelo para los carritos en MongoDB.)
            - **MessagesModel.js** (Esquema de modelo para la mesajeria en MongoDB.)
            - **ProductsModel.js**  (Esquema de modelo para los productos en MongoDB.)
   -  **data** (Contiene la informacion en persistencia de archivos)
      -  **carrito.json** (datos de carritos y sus productos)
      -  **products.json** (datos de los productos)
   -  **middlewares** (Contiene los middleware de la aplicacion)
      -  **logMiddleware.js** (middleware para registrar acceso a metodos CRUD)
   - **public** contiene archivos de acceso publico
      - **css** hoja de estilos.
      - **img** imagenes.
      -  **js** logica de las paginas.
   - **routes** contiene las rutas para los endpoints
      - **carts.router.js** rutas para los endpoints del carrito.
      - **products.router.js** rutas para los endpoints de los productos.
      - **views.router.js** rutas para los endpoints de las vistas handlebars.
   - **views** contiene las vistas handlebars
   - **app.js** (aplicativo principal)
   - **connDB.js** (aplicativo para la conexion a BBDD)


### Contacto
[![N|Solid](/src/public/img/linkedin.png)](https://www.linkedin.com/in/martin-hernandez-9b7154215)
