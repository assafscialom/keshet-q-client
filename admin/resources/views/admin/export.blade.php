@extends('voyager::master')
<script type="application/javascript">

    function getLog(item, hash) {
        fetch("/admin/log/"+hash,{headers: {
                "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]').attributes['content'].value
            }}).then(
            response => response.json()
        ).then(
            success => {
                if(success.length==0){
                    return;
                }
                item.nextElementSibling.style.width =(success[0].inprogress / success[0].fullcount * 100)+"%";
                item.nextElementSibling.innerText = success[0].inprogress +" / "+success[0].fullcount;
            }
        ).catch(
        );
    }


    function upload(e) {
        var form = e.closest("form");
        var item = form.parentElement.parentElement.children[1];
        var data = new FormData(form);
        const hash = Math.random().toString(36).substring(3);
        data.append('hash',hash);
        addMessage(item,'green',"file in progress")
        const timer = setInterval(getLog,1000,item,hash);
        fetch(form.action, { // Your POST endpoint
            method: 'POST',
            headers: {
                "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]').attributes['content'].value
            },
            body: data
        }).then(
            response => {
                /*var reader = response.body.getReader();
                var bytesReceived = 0;

                // read() returns a promise that resolves
                // when a value has been received
                 reader.read().then(function processResult(result) {
                    // Result objects contain two properties:
                    // done  - true if the stream has already given
                    //         you all its data.
                    // value - some data. Always undefined when
                    //         done is true.
                    if (result.done) {
                        console.log("Fetch complete");
                        return;
                    }

                    // result.value for fetch streams is a Uint8Array
                    bytesReceived += result.value.length;
                    console.log('Received', bytesReceived, 'bytes of data so far');

                    // Read some more, and call this function again
                    return reader.read().then(processResult);

                });*/
                return response.json()
            }
        ).then(
            success =>  {
                clearInterval(timer)
                item.nextElementSibling.style.width = "0px";
                addMessage(item,'green',success.message)
            }
        ).catch(
            error  => {
                addMessage(item,'red','you have error')
                clearInterval(timer);
            }
        );
    }

    function addMessage(element,color,message){
        element.style.color = color;
        element.innerText = message;
    }
</script>
@section('content')

    <div class="col-md-3" id="branches">
        <select class="form-control">
            <option>Select Branch</option>
            @foreach($branches as $branch)
                <option value="<?=$branch->id?>"><a href="<?=$branch->id?>"><?=$branch->name?></a></option>
            @endforeach
        </select>
    </div>

    @foreach($branches as $branch)
        <div class="col-md-3 col-md-offset-1 department" id="departments-<?=$branch->id?>" style="display: none;">
            <div class="list-group">
                @foreach($branch->departments as $department)
                    <div class="list-group-item clearfix">
                        <?=$department->name?>
                        <div class="pull-right btn  btn-success btn-file">
                            <span class="glyphicon glyphicon-upload" aria-hidden="true"></span>
                            <form>
                                <input type="hidden" name="department_id" value="<?=$department->id?>">
                                <input type="hidden" name="branch_id" value="<?=$branch->id?>">
                                <input name="file" onchange="upload(this);" type="file">
                            </form>
                        </div>
                            <div class="messages pull-right" style="margin-right: 20px;"></div>

                        <div class="progress" style="width:0%;background-color: rgb(64,209,130);color: white; font-weight: bold; height: 20px; margin-top: 30px; text-align: center; margin-bottom:0px;border-radius: 5px;"></div>
                    </div>
                @endforeach
            </div>
        </div>
    @endforeach
    <style type="text/css">
        .btn-file {
            position: relative;
            overflow: hidden;
        }

        .btn-file input[type=file] {
            position: absolute;
            top: 0;
            right: 0;
            min-width: 100%;
            min-height: 100%;
            font-size: 100px;
            text-align: right;
            filter: alpha(opacity=0);
            opacity: 0;
            outline: none;
            background: white;
            cursor: inherit;
            display: block;
        }
    </style>
<script type="application/javascript">
    document.querySelector("#branches>select").onchange = function (e) {
        let show = document.querySelectorAll('.department[style*="display: block"]');
        for (var i = 0; i < show.length; i++) {
            show[i].style.display = "none";
        }
        document.querySelector("#departments-" + this.value).style.display = "block";
    };
</script>
@endsection