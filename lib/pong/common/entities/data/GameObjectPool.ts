// Note:
/*
   Try implementing your own datastructure
   for the reserve and active lists!
   This way, you can guarantee the runtime complexity
   and have full control over your pool's efficiency.
*/
export function GameObjectPool<GameObject, GameObjectCtor extends { new (): GameObject } >(ctor: GameObjectCtor, reserve: number = 5) {
  return class {
    private activeList: Array<GameObject>;
    private reserveList: Array<GameObject>;

    private numberActive: number;
    private numberReserved: number;

    constructor()
    {
     this.activeList = new Array<GameObject>();
     this.reserveList = new Array<GameObject>();

     this.numberActive = 0;
     this.numberReserved = 0;

     this.initializeReserve(reserve);
    }

    private initializeReserve(reserve: number)
    {
     for(let i = 0; i < reserve; i++)
     {
       const gameObject = new ctor();
       this.reserveList.push(gameObject);
     }
    }

    public getGameObject(): GameObject
    {
      if(this.numberReserved == 0)
      {
        this.reserveList.push(new ctor());
        this.numberReserved++;
      }

      const gameObject = this.reserveList.pop();
      this.numberReserved--;

      this.activeList.push(gameObject!);
      this.numberActive++;

      return gameObject!;
    }

    public returnGameObject(gameObject: GameObject)
    {
      // Get the index of the gameObject in the active list:
      const index = this.activeList.indexOf(gameObject);
      if(index >= 0)
      {
        // Splice the list around the element to remove.
        // Splice can be an expensive operation, which is why
        // I would use a custom collection in a real scenario:
        this.activeList.splice(index, 1);
        this.numberActive--;

        // Add it to the reserve:
        this.reserveList.push(gameObject);
        this.numberReserved++;
      }
    }
  }
}

