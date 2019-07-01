class Relation {
    constructor(sTableName, sColumnName, tTableName, tColumnName) {
        this.sTableName = sTableName;
        this.sColumnName = sColumnName;
        this.tTableName = tTableName;
        this.tColumnName = tColumnName;
    }

    setSGroupPos(x, y) {
        this.startPosX = x;
        this.startPosY = y;
    }

    getSGroupPos() {
        return [this.startPosX, this.startPosY];
    }

    setTGroupPos(x, y) {
        this.endPosX = x;
        this.endPosY = y;
    }

    getTGroupPos() {
        return [this.endPosX, this.endPosY];
    }

    setArrow(arrow) {
        this.arrow = arrow;
    }

    getArrow() {
        return this.arrow;
    }
}


class Designer {
    constructor() {
        this.stage = new Konva.Stage({
            container: container || 'body',
            width: window.innerWidth,
            height: window.innerHeight
        });
        this.layer = new Konva.Layer();
        this.gridInterval = 32;
        this.initGrid();
        this.tables = [];
        this.relations = [];
    }

    initGrid() {
        for (let i = 0; i < this.stage.width() / this.gridInterval; i++) {
            let line = new Konva.Line({
                points: [i * this.gridInterval, 0, i * this.gridInterval, this.stage.height()],
                stroke: 'gray',
                strokeWidth: 0.1,
                lineJoin: 'round',
                dash: [10, 8]
            });
            this.layer.add(line)
        };

        for (let i = 0; i < this.stage.height() / this.gridInterval; i++) {
            let line = new Konva.Line({
                points: [0, i * this.gridInterval, this.stage.width(), i * this.gridInterval],
                stroke: 'gray',
                strokeWidth: 0.1,
                dash: [10, 8]
            });
            this.layer.add(line)
        };
    }

    createTable(tableName, posX, posY) {
        let tableGroup = new Konva.Group({
            x: posX || 120,
            y: posY || 40,
            //rotation: 20,
            draggable: true
        });
        let table = new Table(tableGroup);
        table.setHeader(tableName);
        this.tables.push(table);
        this.layer.add(tableGroup);

        tableGroup.on('dragmove', (e) => {
            this.moveArrow(tableName, e);
        });

        tableGroup.on('mouseenter', () => {
            this.stage.container().style.cursor = 'move';
        });

        tableGroup.on('mouseleave', () => {
            this.stage.container().style.cursor = 'default';
        });

        return table;
    }

    fetchTableByName(tableName) {
        let table;
        this.tables.forEach(function (t, index) {
            if (t.tableName === tableName) {
                table = t;
            }
        });
        return table;
    }

    createRelation(sTableN, sColumnN, tTableN, tColumnN, mapRelation) {
        let sTable = this.fetchTableByName(sTableN),
            tTable = this.fetchTableByName(tTableN),
            sColumnIndex = sTable.columnNames.indexOf(sColumnN),
            tColumnIndex = tTable.columnNames.indexOf(tColumnN);

        let startPosX, startPosY, endPosX, endPosY;
        let sGroupPosX = sTable.group.x(),
            sGroupPosY = sTable.group.y(),
            tGroupPosX = tTable.group.x(),
            tGroupPosY = tTable.group.y();

        if (sGroupPosX < tGroupPosX) {
            startPosX = sGroupPosX + sTable.headerWidth;
            startPosY = sGroupPosY + sTable.headerHeight + sTable.cellHeight * sColumnIndex + sTable.cellHeight / 2;
            endPosX = tGroupPosX;
            endPosY = tGroupPosY + tTable.headerHeight + tTable.cellHeight * tColumnIndex + tTable.cellHeight / 2;
        } else {
            startPosX = sGroupPosX;
            startPosY = sGroupPosY + sTable.headerHeight + sTable.cellHeight * sColumnIndex + sTable.cellHeight / 2;
            endPosX = tGroupPosX + tTable.headerWidth;
            endPosY = tGroupPosY + tTable.headerHeight + tTable.cellHeight * tColumnIndex + tTable.cellHeight / 2;
        }
        console.log(startPosX, startPosY, endPosX, endPosY);

        let arrow = new Konva.Arrow({
            points: [startPosX, startPosY, endPosX, endPosY],
            pointerLength: 10,
            pointerWidth: 10,
            fill: 'black',
            stroke: 'black',
            strokeWidth: 1
        });
        this.layer.add(arrow);

        let relation = new Relation(sTableN, sColumnN, tTableN, tColumnN);
        relation.setSGroupPos(sGroupPosX, sGroupPosY);
        relation.setTGroupPos(tGroupPosX, tGroupPosY);
        relation.setArrow(arrow);
        this.relations.push(relation);
    }


    moveArrow(tableName, e) {
        let arrow;
        for (let rel of this.relations) {
            arrow = rel.getArrow();
            if (rel.sTableName === tableName) {
                let [sGroupPosX, sGroupPosY] = rel.getSGroupPos();
                let offsetX = e.target.x() - sGroupPosX;
                let offsetY = e.target.y() - sGroupPosY;

                let pos = arrow.points();
                arrow.setAttr('points', [pos[0] + offsetX, pos[1] + offsetY, pos[2], pos[3]]);
                rel.setSGroupPos(e.target.x(), e.target.y());

            } else if (rel.tTableName === tableName) {
                let [tGroupPosX, tGroupPosY] = rel.getTGroupPos();
                let offsetX = e.target.x() - tGroupPosX;
                let offsetY = e.target.y() - tGroupPosY;

                let pos = arrow.points();
                arrow.setAttr('points', [pos[0], pos[1], pos[2] + offsetX, pos[3] + offsetY]);
                rel.setTGroupPos(e.target.x(), e.target.y());
            }
        }
    }

    flush() {
        this.stage.add(this.layer);
    }
}