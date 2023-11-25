/*
   This extension was made with TurboBuilder!
   https://turbobuilder-steel.vercel.app/
*/
(function(Scratch) {
    const variables = {};
    const blocks = [];
    const menus = [];


    function doSound(ab, cd, runtime) {
        const audioEngine = runtime.audioEngine;

        const fetchAsArrayBufferWithTimeout = (url) =>
            new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                let timeout = setTimeout(() => {
                    xhr.abort();
                    reject(new Error("Timed out"));
                }, 5000);
                xhr.onload = () => {
                    clearTimeout(timeout);
                    if (xhr.status === 200) {
                        resolve(xhr.response);
                    } else {
                        reject(new Error(`HTTP error ${xhr.status} while fetching ${url}`));
                    }
                };
                xhr.onerror = () => {
                    clearTimeout(timeout);
                    reject(new Error(`Failed to request ${url}`));
                };
                xhr.responseType = "arraybuffer";
                xhr.open("GET", url);
                xhr.send();
            });

        const soundPlayerCache = new Map();

        const decodeSoundPlayer = async (url) => {
            const cached = soundPlayerCache.get(url);
            if (cached) {
                if (cached.sound) {
                    return cached.sound;
                }
                throw cached.error;
            }

            try {
                const arrayBuffer = await fetchAsArrayBufferWithTimeout(url);
                const soundPlayer = await audioEngine.decodeSoundPlayer({
                    data: {
                        buffer: arrayBuffer,
                    },
                });
                soundPlayerCache.set(url, {
                    sound: soundPlayer,
                    error: null,
                });
                return soundPlayer;
            } catch (e) {
                soundPlayerCache.set(url, {
                    sound: null,
                    error: e,
                });
                throw e;
            }
        };

        const playWithAudioEngine = async (url, target) => {
            const soundBank = target.sprite.soundBank;

            let soundPlayer;
            try {
                const originalSoundPlayer = await decodeSoundPlayer(url);
                soundPlayer = originalSoundPlayer.take();
            } catch (e) {
                console.warn(
                    "Could not fetch audio; falling back to primitive approach",
                    e
                );
                return false;
            }

            soundBank.addSoundPlayer(soundPlayer);
            await soundBank.playSound(target, soundPlayer.id);

            delete soundBank.soundPlayers[soundPlayer.id];
            soundBank.playerTargets.delete(soundPlayer.id);
            soundBank.soundEffects.delete(soundPlayer.id);

            return true;
        };

        const playWithAudioElement = (url, target) =>
            new Promise((resolve, reject) => {
                const mediaElement = new Audio(url);

                mediaElement.volume = target.volume / 100;

                mediaElement.onended = () => {
                    resolve();
                };
                mediaElement
                    .play()
                    .then(() => {
                        // Wait for onended
                    })
                    .catch((err) => {
                        reject(err);
                    });
            });

        const playSound = async (url, target) => {
            try {
                if (!(await Scratch.canFetch(url))) {
                    throw new Error(`Permission to fetch ${url} denied`);
                }

                const success = await playWithAudioEngine(url, target);
                if (!success) {
                    return await playWithAudioElement(url, target);
                }
            } catch (e) {
                console.warn(`All attempts to play ${url} failed`, e);
            }
        };

        playSound(ab, cd)
    }
    class Extension {
        getInfo() {
            return {
                "blockIconURI": "data:image/jpeg;base64,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",
                "id": "extensionID",
                "name": "Extension",
                "color1": "#0088ff",
                "color2": "#0063ba",
                "blocks": blocks
            }
        }
    }
    blocks.push({
        opcode: `i guess`,
        blockType: Scratch.BlockType.COMMAND,
        text: `bing chilling`,
        arguments: {},
        disableMonitor: true
    });
    Extension.prototype[`i guess`] = (args, util) => {
        if (Boolean(('bing chilling' == 'bing chilling'))) {
            doSound(`https://www.myinstants.com/media/sounds/bing-chilling_fcdGgUc.mp3`, Scratch.vm.runtime.targets.find(target => target.isStage), Scratch.vm.runtime);
        };
    };

    Scratch.extensions.register(new Extension());
})(Scratch);