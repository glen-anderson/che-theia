/*********************************************************************
 * Copyright (c) 2019 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 **********************************************************************/

import 'reflect-metadata';
import { Container } from 'inversify';
import { CheTaskProvider } from './che-task-provider';
import { MachinesPicker } from './machine/machines-picker';
import { ProjectPathVariableResolver } from './variable/project-path-variable-resolver';
import { CheTaskRunner } from './che-task-runner';
import { ServerVariableResolver } from './variable/server-variable-resolver';
import { CheWorkspaceClient } from './che-workspace/che-workspace-client';
import { CheWorkspaceClientImpl } from './che-workspace/che-workspace-client-impl';
import { MachineExecClient } from './machine/machine-exec-client';
import { CheTerminalWidget, CheTerminalWidgetOptions, TerminalWidgetFactory } from './machine/terminal-widget';
import { CheTaskEventsHandler } from './preview/task-events-handler';
import { TasksPreviewManager } from './preview/tasks-preview-manager';
import { AttachTerminalClient } from './machine/attach-client';
import { PreviewUrlsWidgetFactory, PreviewUrlsWidget, PreviewUrlsWidgetOptions } from './preview/previews-widget';
import { CheTaskPreviewMode } from './preview/task-preview-mode';
import { PreviewUrlOpenService } from './preview/preview-url-open-service';

const container = new Container();
container.bind(CheTaskProvider).toSelf().inSingletonScope();
container.bind(CheTaskEventsHandler).toSelf().inSingletonScope();
container.bind(TasksPreviewManager).toSelf().inSingletonScope();
container.bind(CheTaskRunner).toSelf().inSingletonScope();
container.bind(MachinesPicker).toSelf().inSingletonScope();
container.bind(AttachTerminalClient).toSelf().inSingletonScope();
container.bind(MachineExecClient).toSelf().inSingletonScope();
container.bind(ServerVariableResolver).toSelf().inSingletonScope();
container.bind(ProjectPathVariableResolver).toSelf().inSingletonScope();
container.bind(CheWorkspaceClient).to(CheWorkspaceClientImpl).inSingletonScope();
container.bind(CheTaskPreviewMode).toSelf().inSingletonScope();
container.bind(PreviewUrlOpenService).toSelf().inSingletonScope();

container.bind(CheTerminalWidget).toSelf().inTransientScope();
container.bind(TerminalWidgetFactory).toDynamicValue(ctx => ({
    createWidget: (options: CheTerminalWidgetOptions) => {
        const child = new Container({ defaultScope: 'Singleton' });
        child.parent = ctx.container;
        child.bind(CheTerminalWidgetOptions).toConstantValue(options);
        return child.get(CheTerminalWidget);
    }
}));

container.bind(PreviewUrlsWidget).toSelf().inTransientScope();
container.bind(PreviewUrlsWidgetFactory).toDynamicValue(ctx => ({
    createWidget: (options: PreviewUrlsWidgetOptions) => {
        const child = new Container({ defaultScope: 'Singleton' });
        child.parent = ctx.container;
        child.bind(PreviewUrlsWidgetOptions).toConstantValue(options);
        return child.get(PreviewUrlsWidget);
    }
}));

export { container };