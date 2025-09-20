const request = require('supertest');
const sinon = require('sinon');
const chai = require('chai');
const { expect } = chai;
const app = require('../../../rest/app');
const { equal } = require('assert');
const checkoutService = require('../../../src/services/checkoutService');
const { error } = require('console');

describe('Checkout Controller', () => {
    describe('POST /api/checkout', () => {
        let token;
        beforeEach(async () => {
            const postLogin = require('../fixture/requisicoes/login/postLogin.json');
            const respostaLogin = await request(app)
                .post('/api/users/login')
                .send(postLogin);
            token = respostaLogin.body.token;
        });

        it('Quando envio dados válidos no checkout com pagamento via cartão de crédito, recebo uma resposta 200', async () => {
            const postChekoutSucesso = require('../fixture/requisicoes/checkout/postChekoutSucesso.json');
            const respostaEsperada = require('../fixture/respostas/checkout/quandoEnvioDadosValidosNoCheckoutReceboUmaResposta200.json');
            const checkoutMock = sinon.stub(checkoutService, 'checkout');
            checkoutMock.returns({
                userId: 1,
                items: [
                    {
                        "productId": 1,
                        "quantity": 4
                    }
                ],
                freight: 0,
                paymentMethod: "credit_card",
                total: 380
            });
            const resposta = await request(app)
                .post('/api/checkout')
                .set('Authorization', `Bearer ${token}`)
                .send(postChekoutSucesso);
            expect(resposta.body).to.deep.equal(respostaEsperada);
            expect(resposta.status).to.equal(200);
        });

        it('Quando envio dados válidos no checkout com pagamento via boleto, recebo uma resposta 200', async () => {
            const postChekoutSucesso = require('../fixture/requisicoes/checkout/postChekoutSucesso.json');
            const respostaEsperada = require('../fixture/respostas/checkout/quandoEnvioDadosValidosNoCheckoutReceboUmaResposta200.json');
            const checkoutMock = sinon.stub(checkoutService, 'checkout');
            checkoutMock.returns({
                userId: 1,
                items: [
                    {
                        "productId": 1,
                        "quantity": 7
                    }
                ],
                freight: 0,
                paymentMethod: "boleto",
                total: 700
            });
            const resposta = await request(app)
                .post('/api/checkout')
                .set('Authorization', `Bearer ${token}`)
                .send(postChekoutSucesso);
            respostaEsperada.paymentMethod = "boleto";
            respostaEsperada.items = [{
                productId: 1,
                quantity: 7
            }]
            respostaEsperada.total = 700;
            respostaEsperada.valorFinal = 700;
            expect(resposta.body).to.deep.equal(respostaEsperada);
            expect(resposta.status).to.equal(200);
        });

        const testesDeErroDeNegocio = require('../fixture/requisicoes/checkout/postChekoutWithError.json');
        testesDeErroDeNegocio.forEach(teste => {
            it(`Testando a regra relacionada a ${teste.nomeDoTeste}`, async function () {
                let calculateTotalMock, checkoutMock;
                if (teste.postCheckout.paymentMethod === 'credit_card') {
                    checkoutMock = sinon.stub(checkoutService, 'checkout');
                    checkoutMock.throws(new Error('Dados do cartão obrigatórios para pagamento com cartão'));
                } else if (teste.postCheckout.paymentMethod === 'boleto') {
                    calculateTotalMock = sinon.stub(checkoutService, 'calculateTotal');
                    calculateTotalMock.throws(new Error('Produto não encontrado'));
                }
                const resposta = await request(app)
                    .post('/api/checkout')
                    .set('Authorization', `Bearer ${token}`)
                    .send(teste.postCheckout);
                expect(resposta.status).to.equal(400);
                expect(resposta.body).to.have.property('error', teste.mensagemEsperada);
            });
        });

        afterEach(async () => {
            sinon.restore();
        });
    });

});
