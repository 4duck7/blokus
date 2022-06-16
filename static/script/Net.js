// @ts-nocheck
class Net {
    constructor() {
        this.input = document.getElementById("userLog")
        this.loginBt = document.getElementById("play")
        this.console = document.getElementById('console')

        this.toggleHold = true
        this.turaGracza;

        this.przeciwnik;

        this.loginBt.onclick = () => {
            console.log(this.input.value)

            this.username = this.input.value

            if (this.username.length > 0) {
                let repeat = setInterval(() => {
                    let data = { username: this.username }

                    fetch("/login", { method: "post", body: JSON.stringify(data) })
                        .then(response => response.json())
                        .then(result => {
                            console.log(result)
                            this.handleStart(result, repeat)
                        })
                        .catch(error => console.log(error));

                }, 1000)
            }

            this.requestMove();

        }
    }

    handleStart = (result, interval) => {
        if (result.length > 0) {

            switch (JSON.parse(result).status) {
                case 'wait':
                    ui.logowanie.style.display = 'none';
                    ui.oczekiwanie.style.display = 'block'; break;
                case 'gra':
                    ui.oczekiwanie.style.display = 'none';
                    ui.kamera.style.display = 'block'; break;
            }


            if (JSON.parse(result).launch == true) {

                clearInterval(interval);

                if (JSON.parse(result).id == 0) { game.setCamera(50); game.setColor(0); document.getElementById('logowanie').style.display = 'none'; this.przeciwnik = JSON.parse(result).oponent; document.querySelector('#nick').innerHTML = this.przeciwnik }
                if (JSON.parse(result).id == 1) { game.setCamera(-50); game.setColor(1); document.getElementById('logowanie').style.display = 'none'; this.przeciwnik = JSON.parse(result).oponent; document.querySelector('#nick').innerHTML = this.przeciwnik }
                if (JSON.parse(result).id == 3) { }

            }
        }
    }

    sendMove = (x, z, num) => {

        let data = { x: x, z: z, color: num }

        fetch("/move", { method: "post", body: JSON.stringify(data) })
            .then(response => response.json())
            .then(json => {
                // game.dropTile(json.x, json.z, json.color);
            })
            .catch(error => console.log(error));
    }

    requestMove = () => {

        let repeat = setInterval(() => {
            let data = { color: game.color }
            fetch("/requestmove", { method: "post", body: JSON.stringify(data) })
                .then(response => response.json())
                .then(json => {
                    console.log(json)
                    if (JSON.stringify(json).length > 0) {
                        game.dropTile(json.x, json.z, json.color);

                        console.log(json.turn, game.color, this.turaGracza)
                        if (!this.toggleHold) {
                            if (json.turn == game.color) { this.turaGracza = true; ui.tura.style.display = 'none'; } else { this.turaGracza = false; setTimeout(() => ui.tura.style.display = 'block', 500) }
                        }

                        console.log(this.turaGracza);

                    }

                })
                .catch(error => console.log(error));
        }, 200)
    }

}