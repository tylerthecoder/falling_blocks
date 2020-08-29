import { Game } from "../src/game";
import { Vector3D, Vector, Vector2D } from "../src/utils/vector";
import { CONFIG } from "../src/constants";
import { Chunk } from "../src/world/chunk";
import { Cube } from "../src/entities/cube";
import { IDim } from "../types";
import { BLOCKS } from "../src/blockdata";


interface GameData {
  seed: string;
  world: WorldData;
}

interface WorldData {
  // chunks
  c: ChunkData[]
}

interface ChunkData {
  // blocks
  b: BlockData[];
  pos: string;
}

interface BlockData {
  t: BLOCKS;
  // positon
  p: string;
}

export class GameSaver {

  private serverURL = `${location.href}world`;

  async saveToServer(game: Game) {
    const data: GameData = {
      seed: CONFIG.seed,
      world: {
        c: [],
      }
    };

    const chunks = Array.from(game.world.chunks.values());

    for (const chunk of chunks) {
      const chunkPosVector = new Vector2D(chunk.chunkPos);
      const chunkData: ChunkData = {
        b: [],
        pos: chunkPosVector.toString(),
      };

      if (chunkData.pos.includes("NaN")) {
        console.log("bad");
      }

      for (const block of chunk.getCubesItterable()) {
        const blockVector = new Vector3D(block.pos);

        // do relative pos to the chunk later
        const blockData: BlockData = {
          t: block.type,
          p: blockVector.toString(),
        }

        chunkData.b.push(blockData);
      }

      data.world.c.push(chunkData);
    }

    console.log("Save Data", data);

    fetch(`${location.hostname}/world`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      },
    });
  }

  async load(game: Game) {

    console.log(this.serverURL)

    const gameData = await fetch(this.serverURL).then(x => x.json());

    for (const chunkData of gameData.world.c) {
      const chunkPos = Vector.fromString(chunkData.pos);

      const chunk = new Chunk(
        chunkPos.data,
        game,
      );

      for (const cubeData of chunkData.b) {
        const cube = new Cube(
          cubeData.t,
          Vector.fromString(cubeData.p).data as IDim,
        );

        chunk.addCube(cube, false);
      }

      game.world.setChunkAtPos(chunk, new Vector2D(chunk.chunkPos));
    }
  }
}