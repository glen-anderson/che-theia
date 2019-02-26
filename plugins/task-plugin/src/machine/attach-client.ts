/*********************************************************************
 * Copyright (c) 2019 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 **********************************************************************/

import { injectable, inject } from 'inversify';
import { CheWorkspaceClient } from '../che-workspace/che-workspace-client';

const ReconnectingWebSocket = require('reconnecting-websocket');
const RECONNECTING_OPTIONS = {
    maxReconnectionDelay: 10000,
    minReconnectionDelay: 1000,
    reconnectionDelayGrowFactor: 1.3,
    connectionTimeout: 10000,
    maxRetries: Infinity,
    debug: false
};

const ATTACH_TERMINAL_SEGMENT: string = 'attach';

export interface TerminalProcessOutputHandler {
    onMessage(content: string): void;
}

@injectable()
export class AttachTerminalClient {

    @inject(CheWorkspaceClient)
    protected readonly cheWorkspaceClient!: CheWorkspaceClient;

    async connectTerminalProcess(terminalId: number, outputHandler: TerminalProcessOutputHandler): Promise<void> {
        // console.log('========================== ATTACH client ');
        const termServerEndpoint = await this.cheWorkspaceClient.getMachineExecServerURL();
        const terminalURL = `${termServerEndpoint}/${ATTACH_TERMINAL_SEGMENT}/${terminalId}`;

        const webSocket = await new ReconnectingWebSocket(terminalURL, [], RECONNECTING_OPTIONS);
        // console.log('=== websocket is created ');

        // tslint:disable-next-line:no-any
        webSocket.addEventListener('message', (message: any) => {
            outputHandler.onMessage(message.data);
        });

        webSocket.addEventListener('error', (event: Event) => {
            console.error('Websocket error:', event);
        });
        // console.log('=== after ATTACH client after added listeners');
        // TODO close webSocket when task is completed; event with runtime info is not implemented for plugin API at the moment
    }
}