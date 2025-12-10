export class UniKey{
  private store =new Set();
  static generate(len=32) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < len; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
  constructor(){}
  create(len:number){
    for(;;){
      const result = UniKey.generate(len);
      if(this.store.has(result)){continue;}
      this.store.add(result);
      return result;
    }
  }
  delete(k:string){
    if(!this.store.has(k)){return;}
    this.store.delete(k);
  }
}