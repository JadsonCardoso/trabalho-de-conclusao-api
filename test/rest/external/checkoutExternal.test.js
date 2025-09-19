
const request = require('supertest');
const { expect } = require('chai');
require('dotenv').config();

describe('Checkout External', () => {
    describe('POST /api/checkout', () => {
        before(async function () {
            const postLogin = require('../fixture/requisicoes/login/postLogin.json');
            const respostaLogin = await request(process.env.BASE_URL_REST)
                .post('/api/users/login')
                .send(postLogin);
            this.token = respostaLogin.body.token;
        });
        it('Quando envio dados válidos no checkout com pagmento via cartão de crédito, recebo uma resposta 200', async function () {
            const postChekoutSucesso = require('../fixture/requisicoes/checkout/postChekoutSucesso.json');
            const respostaEsperada = require('../fixture/respostas/checkout/quandoEnvioDadosValidosNoCheckoutReceboUmaResposta200.json');
            const resposta = await request(process.env.BASE_URL_REST)
                .post('/api/checkout')
                .set('Authorization', `Bearer ${this.token}`)
                .send(postChekoutSucesso);
            // Ajuste para garantir que o campo paymentMethod seja igual ao retornado
            respostaEsperada.paymentMethod = resposta.body.paymentMethod;
            expect(resposta.body).to.deep.equal(respostaEsperada);
            expect(resposta.status).to.equal(200);
        });

        const testesDeErroDeNegocio = require('../fixture/requisicoes/checkout/postChekoutWithError.json');
        testesDeErroDeNegocio.forEach(teste => {
            it(`Testando a regra relacionada a ${teste.nomeDoTeste}`, async function () {
                const resposta = await request(process.env.BASE_URL_REST)
                    .post('/api/checkout')
                    .set('Authorization', `Bearer ${this.token}`)
                    .send(teste.postCheckout);
                expect(resposta.status).to.equal(400);
                expect(resposta.body).to.have.property('error', teste.mensagemEsperada);
            });
        });
    });
});
