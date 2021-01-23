import { Game, IGameMetadata, ISerializedGame } from "../../src/game";
import { IChunkReader, ICreateWorldOptions, IWorldData, WorldModel } from "../../src/types";
import { Chunk, ISerializedChunk } from "../../src/world/chunk";

export class ClientChunkReader implements IChunkReader {

  constructor(
    private idbChunkReader?: IChunkReader,
  ) { }

  async getChunk(chunkPos: string) {
    let chunk: Chunk | null = null;
    // console.log("Reading Chunk: ", chunkPos)
    if (this.idbChunkReader) {
      chunk = await this.idbChunkReader.getChunk(chunkPos);
    }
    return chunk;
  }
}

export class ClientDb extends WorldModel {
  private db: IDBDatabase;

  private WORLDS_OBS = "worlds";

  constructor() {
    super();
  }

  async loadDb() {
    return new Promise<void>((resolve, reject) => {
      const openRequest = window.indexedDB.open("TylerCraftDB", 4);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      openRequest.onerror = function (event: any) {
        // Do something with request.errorCode!
        console.log(event.target);
        console.error("Database error: " + event.target.errorCode);
        reject(event.target);
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      openRequest.onsuccess = (event: any) => {
        // Do something with request.result!
        this.db = event.target.result;
        resolve();
      };
      openRequest.onupgradeneeded = () => {
        console.log("Upgrading database");
        // Save the IDBDatabase interface
        const db = openRequest.result;
        // Create an objectStore for this database
        // world id will be the property on the world object used to identify the world
        if (!db.objectStoreNames.contains(this.WORLDS_OBS)) {
          db.createObjectStore(this.WORLDS_OBS, { keyPath: "gameId", autoIncrement: true });

          // objectStore.createIndex("name", "name", { unique: false });
        }
        // add a "name" properties to worlds and make it searchable
      };
    });
  }

  async createWorld(createWorldOptions: ICreateWorldOptions): Promise<IWorldData> {
    const worldId = Math.random() + "";
    return {
      worldId,
      name: createWorldOptions.gameName,
      chunkReader: new ClientChunkReader(),
      config: createWorldOptions.config,
    }
  }

  getAllWorlds(): Promise<IGameMetadata[]> {
    return new Promise((resolve) => {
      const transaction = this.db.transaction([this.WORLDS_OBS]);
      const objectStore = transaction.objectStore(this.WORLDS_OBS);

      const getAllRequest = objectStore.getAll();
      getAllRequest.onsuccess = (event: any) => {
        if (event.target.result) {
          console.log(event);
          const worlds = event.target.result as ISerializedGame[];

          const worldData = worlds.map(world => ({
            gameId: world.gameId,
            name: world.name,
          }));

          resolve(worldData);
        }
      }
    });
  }

  async getWorld(worldId: string): Promise<IWorldData> {
    const world: ISerializedGame = await new Promise((resolve) => {
      const transaction = this.db.transaction([this.WORLDS_OBS]);
      const objectStore = transaction.objectStore(this.WORLDS_OBS);

      const request = objectStore.get(worldId);

      request.onsuccess = (event: any) => {
        const data = event.target.result as ISerializedGame;

        resolve(data)
      }
    });

    // later have an entire object store to keep chunks in.
    const chunkMap = new Map<string, ISerializedChunk>();
    for (const chunk of world.world.chunks) {
      chunkMap.set(chunk.chunkPos, chunk);
    }

    const chunkReader: IChunkReader = {
      getChunk: async (chunkPos: string) => {
        const serializedChunk = chunkMap.get(chunkPos);
        if (!serializedChunk) return null;
        return Chunk.deserialize(serializedChunk);
      }
    };

    return {
      data: {
        gameId: world.gameId,
        config: world.config,
        entities: world.entities,
        world: {
          chunks: [],
          tg: {
            blocksToRender: []
          }
        },
        name: world.name,
      },
      config: world.config,
      chunkReader: new ClientChunkReader(chunkReader),
      activePlayers: [],
      worldId,
      name: world.name,
    }
  }

  async saveWorld(data: Game) {
    const transaction = this.db.transaction([this.WORLDS_OBS], "readwrite");

    console.log(data);

    transaction.oncomplete = () => {
      console.log("All done!");
    };
    transaction.onerror = () => {
      console.log("There was an error", event);
    }
    const objStore = transaction.objectStore("worlds");

    objStore.put(data.serialize());
  }

  async deleteWorld(gameId: string) {
    const transaction = this.db.transaction([this.WORLDS_OBS], "readwrite");

    transaction.oncomplete = () => {
      console.log("All done!");
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transaction.onerror = (event: any) => {
      console.log("There was an error", event);
    }
    const objStore = transaction.objectStore("worlds");
    objStore.delete(gameId);
  }
}
