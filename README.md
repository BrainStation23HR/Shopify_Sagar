# STEPS TO SETUP

## Install the dependency

```
npm install
```

Runt this commands to the root and frontend and web to install all dependency.

## Run the APP as a new app

```
npm run dev
```

use this command to run the app

## Update data

1.update the .env data
2.update host url in the app.js file which is generate in the toml file in dev
3.connect or update the app.js acceessible public route into the dynamic_delivery_scheduler.liquid file which is in Block folder

## Deploy the app

```
shopify app deploy
```

run this command to deploy the updates.

now it should work

## Optional

I created an extension called delivery-customization I thouth I can handle shipping charge using this but I got wrong when Read the documentation,I found it can not change the shipphing charge ammount directly it can just order rename and hide,then I start to work in different procces but I could not complete to read documentation off shopify and the implementation proccess.

To run this extension you need to go graphql zone from the console url after run the app
and get the id of the extension and register the extension using this id

```
query{
  shopifyFunctions(first:10){
    edges{
      node{
        id,
        description,
        title
      }
  	}
  }
}
```

run this to get extension id

```
mutation{
  deliveryCustomizationCreate(deliveryCustomization:{
    functionId:"Extension ID", //d6b1044c-60b6-4ec0-b2b4-9b4d342015ed
		title: "Delivery Customization",
    enabled:true
  })
  {
    deliveryCustomization{
			id
    }
    userErrors{
      message,
      code
    }

  }
}
```

run this to register the extension

## My Feedback

I raaly appreciate to get the oppurtunity ,I learn so many thing from the assesment test ,In my company now We use Laravel and react to create app and never worked like this app logic so I got some challanges to make app In Node express first time but I overcome and try this to make the app .but I can not complete it and here it the output

##Contract
Email:sagar@gmail.com
Mobile:01601103076
