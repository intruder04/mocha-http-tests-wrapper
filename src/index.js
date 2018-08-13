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
        const descr: string = data.descr || '';
        const method: string = data.method || 'post';
        const status: number = data.status || 200;
        const testDescr: string = `#${this.id} ${method.toUpperCase()}: ${data.url} ${status} ${descr}`;
        const set: string = data.set || ['token', ''];
        const auth: Object = data.auth || { login: "", pass: "" };
        const shouldBeEmpty: boolean = data.shouldBeEmpty || false;
        const shouldBeSchema: boolean = data.schema || false;
        const shouldBeUuid: boolean = data.shouldBeUuid || false;
        const shouldBeEqual: boolean = data.shouldBeEqual || false;
        const shouldBeHtml: boolean = data.shouldBeHtml || false;
        const shouldBeJwt: boolean = data.shouldBeJwt || false;
        const jwtShouldBeSignedWith: boolean = data.jwtShouldBeSignedWith || false;
        const params = paramsArg || {};
        let { url } = data;

        const { saveResponse, constructCustomUrl } = params;
        
        it(testDescr, (done: Object) => {

            if (constructCustomUrl) {
                url = this.createCustomUrl(constructCustomUrl);
            }

            chai
            .request(this.server)
            [method](url)
            .set(set[0], set[1])
            .auth(auth.login, auth.pass)
            .send(data.body)
            .end((err: Object, res: Object) => {
                if (err != null && status === 200) {
                    done(err);
                    return;
                }
                try {
                    res.should.have.status(status);
                    res.should.not.be.empty();

                    if (data.json || data.json == null) {
                        res.should.be.json();
                    }

                    if (shouldBeHtml) {
                        res.should.be.html();
                    }

                    if (shouldBeEmpty) {
                        if (shouldBeEmpty.isArray) {
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
                        if (shouldBeUuid.isArray) {
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
                        if (shouldBeJwt.isArray) {
                            for (let i = 0, len = shouldBeJwt.length; i < len; i += 1) {
                                expect(this.variableFromString(res, shouldBeJwt[i])).to.be.a.jwt();
                            }
                        } else {
                            expect(this.variableFromString(res, shouldBeJwt)).to.be.a.jwt();
                        }
                       
                    }

                    if (jwtShouldBeSignedWith) {
                        Object.keys(jwtShouldBeSignedWith).forEach((key: number) => {
                            console.log('key', jwtShouldBeSignedWith[key]);
                            
                            expect(this.variableFromString(res, key)).to.be.signedWith(jwtShouldBeSignedWith[key]);
                        })
                    }

                    if (data.customAssert) {
                        data.customAssert(res);
                    }
                    
                    if (res.body && saveResponse) {
                        this.setStorage(res);
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