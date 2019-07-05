class Line {
    constructor(group) {
        this.group = group;
        this.source = [];
        this.target = [];
        this.relationId = 1;
        this.focusDistance = 20;
        this.srcLines = [];
        this.tgtLines = [];
    }

    fetchFocusPos() {
        let srcYList = this.source.map(function (item) { return item[1] }),
            tgtYList = this.target.map(function (item) { return item[1] }),
            srcMidY = (Math.max(...srcYList) - Math.min(...srcYList)) / 2 + Math.min(...srcYList),
            tgtMidY = (Math.max(...tgtYList) - Math.min(...tgtYList)) / 2 + Math.min(...tgtYList),
            //理论上this.source和this.target各自中的坐标list中x坐标相同，所以取第一个即可
            srcMidX = this.source[0][0],
            tgtMidX = this.target[0][0];

        if (srcMidX === tgtMidX) {
            console.log("heare");
            this.srcFocusX = srcMidX;
            this.srcFocusY = srcMidY < tgtMidY ? srcMidY + this.focusDistance : srcMidY - this.focusDistance;
            this.tgtFocusX = tgtMidX;
            this.tgtFocusY = srcMidY < tgtMidY ? tgtMidY - this.focusDistance : tgtMidY - this.focusDistance;
            console.log(this.srcFocusY, this.tgtFocusY);
        } else {
            let rate = Math.abs((srcMidY - tgtMidY) / (srcMidX - tgtMidX));
            this.srcFocusX = srcMidX < tgtMidX ? srcMidX + this.focusDistance : srcMidX - this.focusDistance;
            this.srcFocusY = srcMidY < tgtMidY ? srcMidY + rate * this.focusDistance : srcMidY - rate * this.focusDistance;
            this.tgtFocusX = srcMidX < tgtMidX ? tgtMidX - this.focusDistance : tgtMidX + this.focusDistance;
            this.tgtFocusY = srcMidY < tgtMidY ? tgtMidY - rate * this.focusDistance : tgtMidY + rate * this.focusDistance;
        }
    }

    start() {
        this.fetchFocusPos();

        for (let pos of this.source) {
            let line = new Konva.Line({
                points: [pos[0], pos[1], this.srcFocusX, this.srcFocusY],
                stroke: 'black',
            });
            this.srcLines.push(line);
            this.group.add(line);
        }

        for (let pos of this.target) {
            let line = new Konva.Line({
                points: [pos[0], pos[1], this.tgtFocusX, this.tgtFocusY],
                stroke: 'black',
            });
            this.tgtLines.push(line);
            this.group.add(line);
        }

        this.arrow = new Konva.Arrow({
            points: [this.srcFocusX, this.srcFocusY, this.tgtFocusX, this.tgtFocusY],
            pointerLength: 10,
            pointerWidth: 10,
            fill: 'black',
            stroke: 'black'
        });
        this.group.add(this.arrow);


        this.srcLabel = new Konva.Text({
            x: this.srcFocusX,
            y: this.srcFocusY,
            text: '1',
            fontSize: 14,
            stroke: "red"
        });

        this.group.add(this.srcLabel);

        this.tgtLabel = new Konva.Text({
            x: this.tgtFocusX,
            y: this.tgtFocusY,
            text: 'N',
            fontSize: 14,
            stroke: "red"
        });

        this.group.add(this.tgtLabel);
    }

    reDraw() {
        this.fetchFocusPos();
        let i = 0;
        for (let sl of this.srcLines) {
            let [x, y] = this.source[i];
            sl.setAttr("points", [x, y, this.srcFocusX, this.srcFocusY]);
            i++;
        }
        i = 0;
        for (let tl of this.tgtLines) {
            let [x, y] = this.target[i];
            tl.setAttr("points", [x, y, this.tgtFocusX, this.tgtFocusY]);
            i++;
        }

        this.arrow.setAttr("points", [this.srcFocusX, this.srcFocusY, this.tgtFocusX, this.tgtFocusY]);

        this.srcLabel.x(this.srcFocusX);
        this.srcLabel.y(this.srcFocusY);

        this.tgtLabel.x(this.tgtFocusX);
        this.tgtLabel.y(this.tgtFocusY);
    }
}
