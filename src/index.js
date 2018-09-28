// @flow
/* eslint class-methods-use-this: 0 */

import type { $Response, $Application } from 'express';
import type { WrapperArgsType, UrlParamType } from './types/tests.types';

const chai = require('chai');
const chaiHttp = require('chai-http');
const dirtyChai = require('dirty-chai');
const chaiAJV = require('chai-json-schema-ajv');
const chaiUUID = require('chai-uuid');
const chaiJWT = require('chai-jwt');

const { expect, should } = chai;

chai.use(expect);
chai.use(should);
chai.use(dirtyChai);
chai.use(chaiAJV);
chai.use(chaiUUID);
chai.use(chaiHttp);
chai.use(chaiJWT);

// to make allure attachements
require('mocha-allure-reporter');

class Test {

    id: number;
    serverApp: $Application;
    storage: Object;

    constructor(serverApp: $Object) {
        this.id = 1;
        this.serverApp = serverApp;
        this.storage = { };
    }

    // mocha test method
    makeRequest(data: Object, paramsArg: WrapperArgsType) {
        let url = data.setUrl;
        const setDescr: string = data.setDescr || '';
        const shouldBeStatus: number = data.shouldBeStatus || 200;
        const setMethod: string = data.setMethod || 'post';
        const testDescr: string = `#${this.id} ${setMethod.toUpperCase()}: ${url} ${shouldBeStatus} ${setDescr}`;
        
        it(testDescr, (done: Object) => {

            let inputData = data;

            const prepareFunc = inputData.prepareRequest || false;
            if (prepareFunc) {
                // console.log('storage - ', this.storage.token);
                const newData = prepareFunc(this.storage);
                // console.log('newData', newData);
                inputData = { ...inputData, ...newData };
                // console.log('inputData', inputData);
            }

            const setHeader = inputData.setHeader || { };

            const { setAuth,
                    setMaxRedirects,
                    shouldBeEmpty,
                    shouldBeSchema,
                    shouldBeUuid,
                    shouldBeEqual,
                    shouldBeFormat,
                    shouldBeJwt,
                    jwtShouldBeSignedWith,
                    saveStorage
                } = inputData;
            
            const params = paramsArg || {};

            const { saveResponse, constructCustomUrl } = params;

            if (constructCustomUrl) {
                url = this.createCustomUrl(constructCustomUrl);
            }

            let chaiObj = chai;

            chaiObj = chaiObj
                .request(this.serverApp)[setMethod](url)

            // add auth 
            if (setAuth) {
                chaiObj = chaiObj
                    .auth(setAuth.login, setAuth.pass);
            }

            // add redirects
            if (typeof setMaxRedirects !== 'undefined' && setMaxRedirects >= 0) {
                chaiObj = chaiObj
                    .redirects(setMaxRedirects);
            }

            // add everything else
            chaiObj
                .set(setHeader)
                .send(inputData.setBody)
                .end((err: Object, res: Object) => {
                    if (err != null && shouldBeStatus === 200) {
                        done(err);
                        return;
                    }
                    try {                        
                        res.should.have.status(shouldBeStatus);
                        res.should.not.be.empty();

                        if (shouldBeFormat) {
                            const resContentType = res.header['content-type'];

                            if (shouldBeFormat === 'json') {
                                res.should.be.json();
                            } else if (shouldBeFormat === 'html') {
                                res.should.be.html();
                            } else if (shouldBeFormat === 'plain') {
                                expect(resContentType).to.include(shouldBeFormat);
                            } else {
                                throw new Error('Wrong format for shouldBeFormat (html, json, plain)');
                            }
                        }

                        if (shouldBeEmpty) {
                            if (Array.isArray(shouldBeEmpty)) {
                                shouldBeEmpty.forEach((empty: string) => {
                                    this.variableFromString(res, empty).should.be.empty();
                                });
                            } else {
                                this.variableFromString(res, shouldBeEmpty).should.be.empty();
                            }
                        }

                        if (shouldBeSchema) {
                            Object.keys(shouldBeSchema).forEach((key: string) => {
                                expect(this.variableFromString(res, key)).to.be.jsonSchema(shouldBeSchema[key]);
                            })
                        }

                        if (shouldBeUuid) {
                            if (Array.isArray(shouldBeUuid)) {
                                shouldBeUuid.forEach((element: string) => {
                                    expect(this.variableFromString(res, element)).to.be.a.uuid();
                                });
                            } else {
                                expect(this.variableFromString(res, shouldBeUuid)).to.be.a.uuid();
                            }
                        }

                        if (shouldBeEqual) {
                            Object.keys(shouldBeEqual).forEach((key: string) => {
                                expect(this.variableFromString(res, key)).to.be.equal(shouldBeEqual[key]);
                            })
                        }

                        if (shouldBeJwt) {
                            if (Array.isArray(shouldBeJwt)) {
                                shouldBeJwt.forEach((element: string) => {
                                    expect(this.variableFromString(res, element)).to.be.a.jwt();
                                });
                            } else {
                                expect(this.variableFromString(res, shouldBeJwt)).to.be.a.jwt();
                            }
                        
                        }

                        if (jwtShouldBeSignedWith) {
                            Object.keys(jwtShouldBeSignedWith).forEach((key: string) => {
                                expect(this.variableFromString(res, key)).to.be.signedWith(jwtShouldBeSignedWith[key]);
                            })
                        }

                        if (inputData.customAssert) {
                            inputData.customAssert(res);
                        }
                        
                        if (res.body && saveResponse) {
                            this.setStorage(res);
                        }

                        
                        if (saveStorage) {
                            saveStorage(res, this.storage);
                            // console.log('this.storage', this.storage);
                        }

                        done();
                        
                    } catch (err2) {
                        // write allure attachements if allure object is populated (allure reporter applied)
                        if (allure._allure.suites.length > 0) {
                            allure.createAttachment('Request to serverApp ', JSON.stringify(chaiObj), 'application/json');
                            allure.createAttachment('serverApp response: ', JSON.stringify(res), 'application/json');
                        }
                        done(err2);
                    }
                });
        });
        this.id += 1;
    }

    // save data in class instance
    setStorage(data: $Response) {
        this.storage = data;
    }

    // attach dot notation string to object to create a variable (target)
    variableFromString(res: $Response, stringArg: string): any {
        const props = stringArg.split('.');
        let target = res;
        props.forEach((prop: string) => {            
            target = target[prop];
            if (typeof target === 'undefined') {
                throw new TypeError(`Test failed! ${stringArg} is undefined in response!`);
            }
        });
        return target;
    }

    // construct url string with data from storage
    createCustomUrl(constructCustomUrl: UrlParamType): string {
        const param = this.variableFromString(this.storage, constructCustomUrl.params);
        return `${constructCustomUrl.url}${param}`;
    }
}

module.exports = Test;