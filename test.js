const { exec } = require("child_process");
["-s"];
exec("explorer ms-screenclip:", {
  cwd:"D:\\Users\\Desktop\\test"
},(...args)=>{
  console.log(args);
});

// await $`ShareX.exe' `;
