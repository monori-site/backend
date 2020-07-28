/*
  @Get('/projects/:uuid', {
    parameters: [
      {
        required: true,
        name: 'uuid'
      }
    ]
  })
  async getProject(req: GetProjectRequest, res: FastifyReply) {
    const batch = this.website.connection.createBatch()
      .pipe(pipelines.Select('projects', ['name', req.params.uuid]));

    const data = await batch.next<Project>();
    if (data === null) return res.status(404).send({ statusCode: 404, message: `Project with name "${req.params.uuid}" was not found.` });
    
    return res.status(200).send({
      statusCode: 200,
      data
    });
  }

  @Put('/projects/:uuid', {
    authenicate: true,
    body: [
      {
        required: true,
        name: 'name'
      }
    ]
  })
  async newProject(req: PutProjectRequest, res: FastifyReply) {
    const session = await this.website.sessions.getSession(req.connection.remoteAddress!);
    const batch = this.website.connection.createBatch()
      .pipe(pipelines.Select('projects', ['name', req.body.name]));

    const result = await batch.next<Project>();
    if (result !== null) return res.status(500).send({
      statusCode: 500,
      message: `Project by name "${req.body.name}" exists`
    });

    const batch2 = this.website.connection.createBatch()
      .pipe(pipelines.Insert<Project>({
        values: {
          translations: [],
          github: null,
          owner: session!.username,
          name: req.body.name
        },
        table: 'projects'
      }));

    await batch2.next<Project>();
    return res.status(201).send({
      statusCode: 201
    });
  }

  @Patch('/projects/:uuid', {
    authenicate: true,
    body: [
      {
        required: true,
        name: 'data'
      }
    ]
  })
  async updateProject(req: PatchProjectRequest, res: FastifyReply) {
    const updates = {};
    if (req.body.data.hasOwnProperty('translations')) {
      if (!Array.isArray(req.body.data.translations)) return res.status(406).send({
        statusCode: 406,
        message: '"translations" must be an Array of objects'
      });

      updates['translations'] = req.body.data.translations;
    }

    if (req.body.data.hasOwnProperty('name')) {
      if (typeof req.body.data.name !== 'string') return res.status(406).send({
        statusCode: 406,
        message: `"username" must be a string (received ${typeof req.body.data.name})`
      });

      const batch = this.website.connection.createBatch()
        .pipe(pipelines.Select('projects', ['name', req.body.data.name]));

      const result = await batch.next<Project>();
      if (result === null) {
        updates['name'] = req.body.data.name;
      } else {
        return res.status(406).send({
          statusCode: 406,
          message: `Name ${req.body.data.name} is already taken`
        });
      }
    }

    const update = this.website.connection.createBatch()
      .pipe(pipelines.Update({
        values: updates,
        table: 'projects',
        type: 'set'
      }));

    try {
      await update.all();
      return res.status(200).send({
        statusCode: 200,
        data: { updated: true }
      });
    } catch(ex) {
      return res.status(500).send({
        statusCode: 500,
        data: {
          updated: false,
          message: ex.message
        }
      });
    }
  }
  */