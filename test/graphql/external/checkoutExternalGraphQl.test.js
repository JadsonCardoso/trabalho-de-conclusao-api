const request = require('supertest');
const { expect } = require('chai');
const { query } = require('express');
require('dotenv').config();

describe('Teste de checkout', () => {
    beforeEach(async () => {
        const loginUser = require('../fixture/requisicoes/login/loginUser.json');
        const resposta = await request(process.env.BASE_URL_GRAPHQL)
            .post('')
            .send(loginUser)

    this.token = resposta.body.data.login.token;

    })

    beforeEach(async () => {
        chekoutSucesso = require('../fixture/requisicoes/checkout/chekoutComSucesso.json');
    });

    it('Teste de checkout com pagamento via cartão de crédito', async () => {
        respostaEsperada = require('../fixture/respostas/validarCheckoutComSucesso.json');
        const respostaCheckout = await request(process.env.BASE_URL_GRAPHQL)
            .post('')
            .set('Authorizations', `Bearer ${this.token}`)
            .send(chekoutSucesso);

        expect(respostaCheckout.status).to.equal(200);
        expect(respostaEsperada.data.checkout).to.deep.equal(respostaEsperada.data.checkout);
    });

    const testesDeErroDeNegocio = require('../fixture/requisicoes/checkout/chekoutWithError.json');

    testesDeErroDeNegocio.forEach(testes => {
        it(`Testando a regra relacionado a ${testes.nomeDoTeste}`, async () => {
            const respostaCheckout = await request(process.env.BASE_URL_GRAPHQL)
                .post('')
                .set('Authorization', `Bearer ${this.token}`)
                .send(testes.checkout);

            expect(respostaCheckout.status).to.equal(200);
            expect(respostaCheckout.body.errors[0].message).to.equal(testes.mensagemEsperada);
        });
    });
})