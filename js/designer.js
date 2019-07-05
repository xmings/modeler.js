class Relation {
    constructor(srcTable, tgtTable) {
        this.srcTable = srcTable;
        this.tgtTable = tgtTable;
        this.srcColumns = [];
        this.tgtColumns = [];
        this.relationId = 1;
        this.line = null;
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
            this.changeRelationPos(tableName, e);
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
        for (let t of this.tables) {
            if (t.tableName === tableName) {
                return t;
            }
        }
    }

    fetchConnectPoint(srcTable, srcCols, tgtTable, tgtCols) {
        let srcColsPos = [], tgtColsPos = [];
        let srcX = srcTable.group.x() < tgtTable.group.x() ? srcTable.group.x() + srcTable.headerWidth : srcTable.group.x();
        let tgtX = srcTable.group.x() < tgtTable.group.x() ? tgtTable.group.x() : tgtTable.group.x() + tgtTable.headerWidth;

        for (let col of srcCols) {
            let srcY = srcTable.columnNames.indexOf(col) * srcTable.cellHeight + srcTable.cellHeight / 2 + srcTable.headerHeight + srcTable.group.y();
            srcColsPos.push([srcX, srcY]);
        }

        for (let col of tgtCols) {
            let tgtY = tgtTable.columnNames.indexOf(col) * tgtTable.cellHeight + tgtTable.cellHeight / 2 + tgtTable.headerHeight + tgtTable.group.y();
            tgtColsPos.push([tgtX, tgtY]);
        }
        return [srcColsPos, tgtColsPos];
    }

    createRelation(srcTabName, srcColList, tgtTabName, tgtColList, relationId) {
        let srcTable = this.fetchTableByName(srcTabName),
            tgtTable = this.fetchTableByName(tgtTabName);

        let relation = new Relation(srcTable, tgtTable);
        relation.srcColumns = srcColList;
        relation.tgtColumns = tgtColList;
        let lineGroup = new Konva.Group({
            draggable: true
        });
        this.layer.add(lineGroup);

        relation.line = new Line(lineGroup);
        relation.relationId = relationId || 1;
        [relation.line.source, relation.line.target] = this.fetchConnectPoint(srcTable, srcColList, tgtTable, tgtColList);
        relation.line.start();

        for (let r of this.relations) {
            if (r.srcTable.tableName === srcTabName
                && r.tgtTable.tableName === tgtTabName) {
                return;
            }
        }

        this.relations.push(relation);
    }


    changeRelationPos(tableName, e) {
        for (let rel of this.relations) {
            if (rel.srcTable.tableName === tableName || rel.tgtTableame === tableName) {
                //rel.line.group.destroy(true);
                // rel.line.group.preventDefault();
                // console.log(rel, rel.line, rel.line.group);
                // console.log(rel.srcTable.tableName,rel.srcColumns,rel.tgtTable.tableName,rel.tgtColumns);
                // this.createRelation(rel.srcTable.tableName,rel.srcColumns,rel.tgtTable.tableName,rel.tgtColumns);
                // rel.line.group.preventDefault();

                [rel.line.source, rel.line.target] = this.fetchConnectPoint(rel.srcTable, rel.srcColumns, rel.tgtTable, rel.tgtColumns);
                
                rel.line.reDraw();
                
            }
        }
    }



    flush() {
        this.stage.add(this.layer);
    }
}