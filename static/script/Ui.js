// @ts-nocheck
class Ui {
    constructor() {
        this.input = document.getElementById("userLog")
        this.input.placeholder = 'username'

        this.oczekiwanie = document.getElementById("oczekiwanie")
        this.kamera = document.getElementById("kamera")
        this.logowanie = document.getElementById("logowanie")
        this.gra = document.getElementById("gameOn")

        this.oczekiwanie.style.display = 'none';
        this.kamera.style.display = 'none';
        this.gra.style.display = 'none'

        this.ok = document.querySelector('#ok')
        this.ok.onclick = () => { this.kamera.style.display = 'none'; setTimeout(() => net.toggleHold = false, 500) }

        this.gameOnOk = document.querySelector('#gameOnOk')
        this.gameOnOk.onclick = () => { this.gra.style.display = 'none'; }

    }
}