import { Player } from "../src/entities/player";
import { PlayerKeyboardController } from "./controllers/playerKeyboardController";
import { Camera } from "./cameras/camera";
import { EntityCamera } from "./cameras/entityCamera";
import { Game } from "../src/game";
import { RenderType, Entity } from "../src/entities/entity";
import { SocketHandler } from "./socket";
import { canvas } from "./canvas";
import { IDim, IAction, IActionType } from "../types";
import WorldRenderer from "./renders/worldRender";
import { GameSaver } from "./gameSaver";
import { BLOCKS } from "../src/blockdata";
import { ControllerHolder } from "./controllerHolder";
import { Spectator } from "../src/entities/spectator";
import { Cube } from "../src/entities/cube";
import { ISocketMessage, ISocketMessageType } from "../types/socket";

export class ClientGame extends Game {
  controllers = new ControllerHolder(this);
  worldRenderer = new WorldRenderer(this.world, this);
  saver = new GameSaver();
  spectator: Spectator;
  camera: Camera;
  socket: SocketHandler;
  selectedBlock: BLOCKS = BLOCKS.stone;
  numOfBlocks = 7;

  totTime = 0;
  pastDeltas: number[] = [];
  get frameRate() {
    this.pastDeltas = this.pastDeltas.slice(-20);
    const totTime = this.pastDeltas.reduce((acc, cur) => acc + cur);
    return totTime / Math.min(this.pastDeltas.length, 20);
  }

  constructor() {
    super();
    this.load();
    this.setup();
  }

  async load() {
    await canvas.loadProgram();

    if (this.multiPlayer) {
      this.socket = new SocketHandler(this);
      await this.socket.connect();
    }

    this.setUpPlayer();
    // this.setUpSpectator();

    this.world.load();

    // load the game from server
    // await this.saver.load(this);

    requestAnimationFrame(this.loop.bind(this));
  }

  loop(time: number) {
    const delta = time - this.totTime;

    this.controllers.update(delta);
    this.update(delta);
    this.worldRenderer.render(this);

    this.pastDeltas.push(delta);
    this.totTime = time;

    requestAnimationFrame(this.loop.bind(this));
  }

  // this will be called by the super class when a new entity is added
  onNewEntity(entity: Entity) {
    this.worldRenderer.addEntity(entity);
  }

  onRemoveEntity(uid: string) {
    this.worldRenderer.removeEntity(uid);
  }

  clientActionListener (action: IAction) {
    if (action.blockUpdate) {
      this.worldRenderer.blockUpdate(action.blockUpdate.chunkId)
    }
  }

  // this will be called by the super class when actions are received
  onActions(actions: IAction[]) {
    if (this.multiPlayer && actions.length > 0) {
      this.socket.send({
        type: ISocketMessageType.actions,
        actionPayload: actions.filter(a => !a.isFromServer)
      });
    }
  }

  onClick(e: MouseEvent) {
    const data = this.world.lookingAt(this.camera.pos.data as IDim, this.camera.rotCart.data as IDim);

    if (!data) return;

    if (e.which === 3) { // right click
      this.actions.push({
        type: IActionType.playerPlaceBlock,
        playerPlaceBlock: {
          blockType: this.selectedBlock,
          blockPos: data.newCubePos.data as IDim,
        }
      });
    } else if (e.which === 1) { // left click
      this.actions.push({
        type: IActionType.removeBlock,
        removeBlock: {
          blockPos: (data.entity as Cube).pos.data as IDim,
        }
      });
    }
  }

  onMouseMove(e: MouseEvent) {
    this.camera.handleMouse(e);
  }

  removeEntityFromGame(uid: string) {
    const entity = this.findEntity(uid);
    this.controllers.remove(entity);
    this.removeEntity(uid);
  }

  toggleThirdPerson() {
    if (this.camera instanceof EntityCamera) {
      this.camera.thirdPerson = !this.camera.thirdPerson;
      this.worldRenderer.shouldRenderMainPlayer = !this.worldRenderer.shouldRenderMainPlayer;
    }
  }

  setUpPlayer() {
    const playerController = new PlayerKeyboardController(this.mainPlayer, this);
    this.controllers.add(playerController);
    this.camera = new EntityCamera(this.mainPlayer);
  }

  setUpSpectator() {
    this.spectator = new Spectator();
    this.addEntity(this.spectator);
    this.camera = new EntityCamera(this.spectator);
    const spectatorController = new PlayerKeyboardController(this.spectator, this);
    this.controllers.add(spectatorController);
    this.worldRenderer.shouldRenderMainPlayer = true;
  }

  toggleCreative() {
    if (this.mainPlayer.creative) {
      this.mainPlayer.setCreative(false);
    } else {
      this.mainPlayer.setCreative(true);
    }
  }

  save() {
    this.saver.saveToServer(this);
  }

  sendMessageToServer(message: ISocketMessage) {
    this.socket.send(message);
  }
}

export const game = new ClientGame();

// for debugging
(window as any).game = game;
