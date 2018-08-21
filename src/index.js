/* eslint class-methods-use-this: 0 */
/* jshint expr: true */
import type { $Application, $Response } from 'express';
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

class Test {
    constructor(server: $Application) {
        this.id = 1;
        this.server = server;
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

            const setHeader: string = inputData.setHeader || { };
            const setAuth: Object = inputData.setAuth || false;
            const setMaxRedirects: number = inputData.setMaxRedirects || false;

            const shouldBeEmpty = inputData.shouldBeEmpty || false;
            const shouldBeSchema = inputData.schema || false;
            const shouldBeUuid = inputData.shouldBeUuid || false;
            const shouldBeEqual = inputData.shouldBeEqual || false;
            const shouldBeFormat = inputData.shouldBeFormat || false;
            const shouldBeJwt: boolean = inputData.shouldBeJwt || false;
            const jwtShouldBeSignedWith: boolean = inputData.jwtShouldBeSignedWith || false;
            
            const saveStorage: boolean = inputData.saveStorage || false;
            const params = paramsArg || {};

            const { saveResponse, constructCustomUrl } = params;

            if (constructCustomUrl) {
                url = this.createCustomUrl(constructCustomUrl);
            }

            let chaiObj = chai;

            chaiObj = chaiObj
                .request(this.server)[setMethod](url)

            // add auth 
            if (setAuth) {
                chaiObj = chaiObj
                    .auth(setAuth.login, setAuth.pass);
            }

            // add redirects
            if (setMaxRedirects) {
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
                        } else {
                            res.should.be.json();
                        }

                        if (shouldBeEmpty) {
                            if (Array.isArray(shouldBeEmpty)) {
                                for (let i = 0, len = shouldBeEmpty.length; i < len; i += 1) {
                                    this.variableFromString(res, shouldBeEmpty[i]).should.be.empty();
                                }
                            } else {
                                this.variableFromString(res, shouldBeEmpty).should.be.empty();
                            }
                        }

                        if (shouldBeSchema) {
                            Object.keys(shouldBeSchema).forEach((key: number) => {
                                expect(this.variableFromString(res, key)).to.be.jsonSchema(shouldBeSchema[key]);
                            })
                        }

                        if (shouldBeUuid) {
                            if (Array.isArray(shouldBeUuid)) {
                                for (let i = 0, len = shouldBeUuid.length; i < len; i += 1) {
                                    expect(this.variableFromString(res, shouldBeUuid[i])).to.be.a.uuid();
                                }
                            } else {
                                expect(this.variableFromString(res, shouldBeUuid)).to.be.a.uuid();
                            }
                        }

                        if (shouldBeEqual) {
                            Object.keys(shouldBeEqual).forEach((key: number) => {
                                expect(this.variableFromString(res, key)).to.be.equal(shouldBeEqual[key]);
                            })
                        }

                        if (shouldBeJwt) {
                            if (Array.isArray(shouldBeJwt)) {
                                for (let i = 0, len = shouldBeJwt.length; i < len; i += 1) {
                                    expect(this.variableFromString(res, shouldBeJwt[i])).to.be.a.jwt();
                                }
                            } else {
                                expect(this.variableFromString(res, shouldBeJwt)).to.be.a.jwt();
                            }
                        
                        }

                        if (jwtShouldBeSignedWith) {
                            Object.keys(jwtShouldBeSignedWith).forEach((key: number) => {
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
                        
                    } catch (error) {
                        // console.log(JSON.stringify(res.body, null, 2));
                        done(error);
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
    variableFromString(res: $Response, stringArg: string): Object {
        const props = stringArg.split('.');
        let target = res;
        for(let i=0,len=props.length; i<len; i += 1) {
            target = target[props[i]];
            if ( typeof target === 'undefined' ) {
                throw new Error(`Test failed! ${stringArg} is undefined in response!`);
            }
        }
        return target;
    }

    // construct url string with data from storage
    createCustomUrl(constructCustomUrl: UrlParamType): string {
        const param = this.variableFromString(this.storage, constructCustomUrl.params);
        return `${constructCustomUrl.url}${param}`;
    }
}

module.exports = Test;