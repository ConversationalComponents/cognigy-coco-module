Cognigy-[CoCo](https://www.conversationalcomponents.com) Integration

[Installation instructions](https://docs.cognigy.com/docs/integration-framework#section-4-upload-your-module)

[Tutorial video](https://www.youtube.com/watch?v=pNab4QxDI8E)

  - Download cognigy-coco-module.zip from /release folder
  - Login to Cognigy
  - Click on your profile (it's in upper right corner)
  - Select "Integration Framework"
  - Click UPLOAD button
  - Select cognigy-coco-module.zip
  - Wait for upload to complete
  - Coco module is now installed

Use instructions
  - In a flow, choose Create Node>Modules>Coco>CoCo
  - Double-click the module node
  - Input a component id (for example, "namer_vp3")
  - Input your dev key
  - Component is now ready
  - tip: when testing for component status, also test for context structure, like ``` (!cc.coco) || !!cc.coco&&!!cc.coco.completed&&(!cc.coco.completed.namer_vp3||cc.coco.completed.namer_vp3 === false) ``` 
  
API
  - Coco modules write to Cognigy Context under "coco"
  - The "coco" section of context is a JSON object with the following structure:
  coco:
  ``` 
  {
     "completed": {},       // coco components that completed add their id here
     "failed": {},          // coco components that failed add their id here
     "session_id":string    // current component's session id
     [component_id]:{}      // each component writes the last interaction result under its id
     "updated_context": {}  // information components gathered goes here
  } 
  ```
  
  [Conversational Components documentation](https://docs.conversationalcomponents.com/)

  For more components and their customizations please see our [Marketplace](https://marketplace.conversationalcomponents.com/)
